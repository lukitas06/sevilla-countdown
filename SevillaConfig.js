// SevillaConfig.js — the ONE file you edit.
//
// A Scriptable module. Every other script does `importModule("SevillaConfig")`
// and reads these values. Change the trip? Edit `targetISO` and you're done.

module.exports = {
  // ── The trip ────────────────────────────────────────────────────────────
  // Arrival moment in SEVILLA LOCAL TIME, written with an explicit UTC offset.
  // December in Spain is CET = UTC+1, so the offset is +01:00.
  // (Spain is only on CEST/+02:00 until the last Sunday of October.)
  // Format: "YYYY-MM-DDThh:mm:ss+01:00"
  // Real arrival: 13 Dec 2026, 21:05 Sevilla time (CET). The day-count flips at
  // Sevilla midnight; the exact time only drives the "X d · Y h" line in the
  // final 48h and the precise countdown on the status screen.
  targetISO: "2026-12-13T21:05:00+01:00",

  // When the countdown "started": the day she flew to Sevilla — 25 Aug 2026,
  // 21:00 URUGUAY time (UTC-3, no DST → offset -03:00). Only used to draw the
  // progress bar (fraction of the whole separation elapsed). Set null to hide.
  // Offsets can differ between start (Uruguay) and target (Sevilla) — the math
  // uses absolute instants, so that's fine.
  startISO: "2026-08-25T21:00:00-03:00",

  // Which clock the day-count ticks on:
  //   "madrid" → flips at midnight in Sevilla (right, since it's on HER phone)
  //   "local"  → flips at the phone's own midnight (use if it lived on yours)
  tickTimezone: "madrid",

  // ── The place ───────────────────────────────────────────────────────────
  // Widget/notification copy is about "el reencuentro" (the reunion) in this
  // city. `you` is kept for reference / future personalization but isn't shown.
  you: "Lucas",
  city: "Sevilla",

  // ── Notification cadence ────────────────────────────────────────────────
  // A "good morning, X days left" nudge every day for the final N days:
  dailyNudgeWindowDays: 14,
  dailyNudgeHour: 9, // 24h clock, Sevilla local
  dailyNudgeMinute: 0,

  // One-off milestone pings at these days-remaining, each at milestoneHour:
  milestones: [30, 14, 7, 3, 1],
  milestoneHour: 9,

  // The big-day blast (fires at this local time on arrival day):
  bigDayHour: 0,
  bigDayMinute: 1, // 00:01 → "it's TODAY" the moment the day begins

  // ── Cosmetics ───────────────────────────────────────────────────────────
  gradientTop: "#ff6b6b",
  gradientBottom: "#c1121f",

  // Put a photo file in the Scriptable folder and name it here (e.g. "us.jpg")
  // to use it as the widget background instead of the gradient. null = gradient.
  photoFileName: null,
};
