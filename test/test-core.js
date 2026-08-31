// Off-device sanity test for SevillaCore's timezone math.
// Run from anywhere:  node test/test-core.js
// Injects a config, then checks daysRemaining / offsets / midnight across cases.
const path = require("path");
const ROOT = path.join(__dirname, "..");

globalThis.__SEVILLA_CONFIG__ = {
  targetISO: "2026-12-19T14:30:00+01:00", // arrival, Sevilla CET
  startISO: "2026-08-01T00:00:00+02:00",
  tickTimezone: "madrid",
};
const core = require(path.join(ROOT, "SevillaCore.js"));

const iso = (d) => d.toISOString();
const madrid = (d) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);

let pass = 0,
  fail = 0;
function check(label, got, want) {
  const ok = got === want;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}: got=${got}${ok ? "" : `  want=${want}`}`);
  ok ? pass++ : fail++;
}

// ── daysRemaining across the Sevilla-midnight boundary ─────────────────────
check("18 Dec 23:59 Madrid → 1 day left", core.daysRemaining(new Date("2026-12-18T22:59:00Z")), 1);
check("19 Dec 00:01 Madrid → 0 (today)", core.daysRemaining(new Date("2026-12-18T23:01:00Z")), 0);
check("19 Dec 20:00 Madrid → 0 (today)", core.daysRemaining(new Date("2026-12-19T19:00:00Z")), 0);
check("20 Dec 10:00 Madrid → -1", core.daysRemaining(new Date("2026-12-20T09:00:00Z")), -1);
check("19 Nov 12:00 Madrid → 30 days", core.daysRemaining(new Date("2026-11-19T11:00:00Z")), 30);

// ── zoneOffsetMinutes (DST) ────────────────────────────────────────────────
check("Madrid offset in Dec = 60", core.zoneOffsetMinutes("Europe/Madrid", new Date("2026-12-19T12:00:00Z")), 60);
check("Madrid offset in Aug = 120", core.zoneOffsetMinutes("Europe/Madrid", new Date("2026-08-01T12:00:00Z")), 120);

// ── nextLocalMidnight lands on 00:0x Madrid ────────────────────────────────
const nm = core.nextLocalMidnight(new Date("2026-12-10T12:00:00Z"));
console.log(`     nextLocalMidnight(10 Dec) → ${iso(nm)}  (Madrid: ${madrid(nm)})`);
check("nextLocalMidnight is 00:01 Madrid on the 11th", madrid(nm), "11/12/2026, 00:01");

// ── preciseLeft ────────────────────────────────────────────────────────────
const p = core.preciseLeft(new Date("2026-12-18T14:30:00+01:00"));
check("preciseLeft exactly 1 day before → 1d 0h 0m", `${p.days}d ${p.hours}h ${p.mins}m`, "1d 0h 0m");

// ── progressFraction within [0,1] ──────────────────────────────────────────
const frac = core.progressFraction(new Date("2026-10-10T00:00:00Z"));
console.log(`     progressFraction(10 Oct) = ${frac?.toFixed(3)}`);
check("progress is between 0 and 1", frac > 0 && frac < 1, true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
