// Sevilla Notifications.js — schedules the whole countdown of local
// notifications in one idempotent batch.
//
// Exports scheduleAll(). Also runs itself when opened directly in Scriptable
// (see the tail). iOS can't run this in the background, so the batch is
// pre-scheduled while the app is open — for a FIXED date that fully covers the
// countdown (schedule once and you're done). iOS caps pending local
// notifications at 64; this design uses ~21.

const core = importModule("SevillaCore");
const cfg = importModule("SevillaConfig");

// ── Pure planner (no Scriptable API — unit-testable off-device) ────────────
// Returns an ordered list of {id, when(Date), title, body, big} for all
// notifications whose fire time is still in the future relative to `now`.
function planNotifications(now = new Date()) {
  const tz = core.zoneOf();
  const b = core.ymdInZone(core.target, tz); // arrival's calendar date in tick zone

  // A Date for "arrival-day minus `daysBefore`, at hour:minute local".
  function atLocal(daysBefore, hour, minute) {
    const baseUTCms = Date.UTC(b.y, b.m - 1, b.d) - daysBefore * 86_400_000;
    // Offset of the tick zone on that calendar day (handles DST edges).
    const offMin = core.zoneOffsetMinutes(tz, new Date(baseUTCms));
    return new Date(baseUTCms + (hour * 60 + minute - offMin) * 60_000);
  }

  const out = [];
  const push = (id, when, title, body, big = false) => {
    if (when > now) out.push({ id, when, title, body, big });
  };

  // Milestones (30/14/7/3/1 …)
  for (const dB of cfg.milestones) {
    push(
      `sevilla-ms-${dB}`,
      atLocal(dB, cfg.milestoneHour, 0),
      `${dB === 1 ? "¡Falta 1 día!" : `Faltan ${dB} días`} ✈️`,
      `${dB} ${dB === 1 ? "día" : "días"} para ver a ${cfg.you} en ${cfg.city}`
    );
  }

  // Daily "good morning" nudges for the final window, live count baked in.
  for (let dB = cfg.dailyNudgeWindowDays; dB >= 1; dB--) {
    push(
      `sevilla-daily-${dB}`,
      atLocal(dB, cfg.dailyNudgeHour, cfg.dailyNudgeMinute),
      "Buenos días ☀️",
      `Faltan ${dB} ${dB === 1 ? "día" : "días"} para ${cfg.city}`
    );
  }

  // Big-day blast: at 00:0x, and again that morning.
  push("sevilla-bigday-mid", atLocal(0, cfg.bigDayHour, cfg.bigDayMinute), "¡HOY! 🎉✈️", `Hoy llega ${cfg.you}. ¡Tocá el widget!`, true);
  push("sevilla-bigday-am", atLocal(0, cfg.dailyNudgeHour, 0), "¡Es el día! 🇪🇸❤️", `${cfg.city} los espera.`, true);

  return out;
}

// ── Scheduler (Scriptable Notification API) ────────────────────────────────
async function scheduleAll() {
  // 1) Clear our own previously-scheduled items so re-running never duplicates.
  const pending = await Notification.allPending();
  const ours = pending.filter((n) => (n.identifier || "").startsWith("sevilla-")).map((n) => n.identifier);
  if (ours.length) await Notification.removePending(ours);

  // 2) Schedule the plan.
  const plan = planNotifications();
  for (const item of plan) {
    const n = new Notification();
    n.identifier = item.id;
    n.title = item.title;
    n.body = item.body;
    n.sound = item.big ? "event" : "default";
    n.scriptName = "Sevilla Widget"; // long-press the notification → celebration
    n.setTriggerDate(item.when);
    await n.schedule();
  }

  // 3) Evergreen safety net: a single repeating daily trigger. Static body
  //    (the script isn't running when it fires, so it can't count), but its
  //    long-press → Run re-invokes this scheduler to top things up.
  const ever = new Notification();
  ever.identifier = "sevilla-evergreen";
  ever.title = "Countdown Sevilla 👀";
  ever.body = `Abrí para ver los días que faltan para ${cfg.you}`;
  ever.scriptName = "Sevilla Notifications";
  ever.setDailyTrigger(cfg.dailyNudgeHour, 30, true);
  await ever.schedule();

  const total = (await Notification.allPending()).length;
  return { scheduled: plan.length + 1, pending: total };
}

module.exports = scheduleAll;
module.exports.planNotifications = planNotifications; // exposed for tests

// NOTE: This file is a pure module — it must NOT use top-level `await` or run
// anything on import. Scriptable's importModule() breaks (returns undefined /
// throws "undefined is not an object") if an imported module is async. To
// schedule from here directly, run "Sevilla Setup" instead. If you want to run
// this file on its own, long-press it → Run, and it schedules via Setup's path.
