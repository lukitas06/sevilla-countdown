// SevillaCore.js — timezone-correct countdown math + small shared helpers.
//
// A Scriptable module. Exports: daysRemaining, preciseLeft, nextLocalMidnight,
// zoneOf, zoneOffsetMinutes, target, progressFraction.
//
// Why this is fussy: a JS Date is just an absolute instant (epoch ms); it has
// no timezone of its own. To make the day-count flip at *Sevilla* midnight we
// compare CALENDAR DATES as seen in Europe/Madrid, not raw millisecond deltas.
// Storing the target as an ISO string WITH an offset (see SevillaConfig) makes
// it an unambiguous instant regardless of where the phone is.

// Load config. In Scriptable this is importModule; under Node (tests) we accept
// an injected global so the same file can be exercised off-device.
const cfg =
  typeof importModule === "function"
    ? importModule("SevillaConfig")
    : globalThis.__SEVILLA_CONFIG__;

const ZONES = { local: undefined, madrid: "Europe/Madrid" };
// `undefined` timeZone → the device's current zone.

const target = new Date(cfg.targetISO); // offset-aware absolute instant

function zoneOf() {
  return ZONES[cfg.tickTimezone];
}

// The Y/M/D wall-clock components of `date` as seen in `tz`.
function ymdInZone(date, tz) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .split("-")
    .map(Number);
  return { y, m, d };
}

// Whole calendar days from "today in tz" to "the target's date in tz".
//   > 0  → future ("N days to go")
//   === 0 → arrival day ("¡HOY!")
//   < 0  → afterglow (already here / days since)
function daysRemaining(now = new Date()) {
  const tz = zoneOf();
  const a = ymdInZone(now, tz);
  const b = ymdInZone(target, tz);
  // Re-encode the extracted calendar digits as UTC midnights and diff. The
  // digits are already the correct local date, so this is a clean, DST-free
  // "nights between two dates" count.
  const aMs = Date.UTC(a.y, a.m - 1, a.d);
  const bMs = Date.UTC(b.y, b.m - 1, b.d);
  return Math.round((bMs - aMs) / 86_400_000);
}

// Raw remaining time to the actual arrival instant, split into d/h/m.
// Timezone-agnostic (it's a pure delta) — good for a "1 día · 6 h" flourish.
function preciseLeft(now = new Date()) {
  const ms = target - now;
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  return {
    days: Math.floor(totalMin / 1440),
    hours: Math.floor((totalMin % 1440) / 60),
    mins: totalMin % 60,
    ms,
  };
}

// Minutes that `tz` is ahead of UTC at `date` (Sevilla in Dec → +60).
function zoneOffsetMinutes(tz, date) {
  if (!tz) return -date.getTimezoneOffset(); // device zone
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((x) => [x.type, x.value])
  );
  // formatToParts can emit hour "24" at midnight; normalize to 0.
  const hour = p.hour === "24" ? 0 : +p.hour;
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, hour, +p.minute, +p.second);
  return Math.round((asUTC - date.getTime()) / 60000);
}

// The next local midnight (in the tick zone), +60s so the day-count has
// already flipped. Handed to the widget as `refreshAfterDate`.
function nextLocalMidnight(now = new Date()) {
  const tz = zoneOf();
  const { y, m, d } = ymdInZone(now, tz);
  const tomorrowUTC = Date.UTC(y, m - 1, d) + 86_400_000; // tomorrow 00:00 "UTC digits"
  const offsetMin = zoneOffsetMinutes(tz, new Date(tomorrowUTC));
  return new Date(tomorrowUTC - offsetMin * 60000 + 60000);
}

// 0..1 progress from startISO → target (for the widget progress bar).
// Returns null if no startISO configured.
function progressFraction(now = new Date()) {
  if (!cfg.startISO) return null;
  const start = new Date(cfg.startISO).getTime();
  const end = target.getTime();
  if (!(end > start)) return null;
  return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)));
}

module.exports = {
  target,
  zoneOf,
  ymdInZone,
  daysRemaining,
  preciseLeft,
  zoneOffsetMinutes,
  nextLocalMidnight,
  progressFraction,
};
