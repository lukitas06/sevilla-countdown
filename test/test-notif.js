// Off-device test of the notification fire-time planner.
// Run from anywhere:  node test/test-notif.js
// Shims Scriptable globals so Sevilla Notifications.js loads under Node, then
// exercises its pure planNotifications() planner.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const CONFIG = {
  targetISO: "2026-12-19T14:30:00+01:00",
  startISO: "2026-08-01T00:00:00+02:00",
  tickTimezone: "madrid",
  you: "Lucas",
  city: "Sevilla",
  dailyNudgeWindowDays: 14,
  dailyNudgeHour: 9,
  dailyNudgeMinute: 0,
  milestones: [30, 14, 7, 3, 1],
  milestoneHour: 9,
  bigDayHour: 0,
  bigDayMinute: 1,
};
globalThis.__SEVILLA_CONFIG__ = CONFIG;
const core = require(path.join(ROOT, "SevillaCore.js"));

// Load the notifications source, strip its importModule lines + auto-run tail,
// and eval just the exported planNotifications inside an async wrapper.
let src = fs.readFileSync(path.join(ROOT, "Sevilla Notifications.js"), "utf8");
const stripped = src
  .replace(/^const core = importModule[^\n]*\n/m, "")
  .replace(/^const cfg = importModule[^\n]*\n/m, "");

const wrapped = `(async () => {
  const module = { exports: {} };
  ${stripped}
  return module.exports.planNotifications;
})()`;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const run = new AsyncFunction(
  "core",
  "cfg",
  "config",
  "Notification",
  "Alert",
  "Script",
  "importModule",
  "return " + wrapped
);

(async () => {
  const planNotifications = await run(
    core,
    CONFIG,
    { runsInApp: false },
    function () {},
    function () {},
    {},
    (n) => (n === "SevillaCore" ? core : CONFIG)
  );

  const madrid = (d) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", dateStyle: "short", timeStyle: "short" }).format(d);

  let pass = 0,
    fail = 0;
  const check = (label, got, want) => {
    const ok = got === want;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}: ${got}${ok ? "" : "  want " + want}`);
    ok ? pass++ : fail++;
  };

  const plan = planNotifications(new Date("2026-10-01T00:00:00Z"));
  console.log(`\nPlanned ${plan.length} notifications:`);
  for (const p of plan) console.log(`  ${p.id.padEnd(20)} → ${madrid(p.when)}   "${p.title}"`);
  console.log("");

  check("total count = 21", plan.length, 21);

  const nonMidnight = plan.filter((p) => p.id !== "sevilla-bigday-mid");
  check("all non-midnight fire at 09:00 Madrid", nonMidnight.every((p) => madrid(p.when).endsWith("09:00")), true);

  check("midnight blast is 00:01 Madrid on the 19th", madrid(plan.find((p) => p.id === "sevilla-bigday-mid").when), "19/12/2026, 00:01");
  check("30-day milestone fires 19 Nov 09:00 Madrid", madrid(plan.find((p) => p.id === "sevilla-ms-30").when), "19/11/2026, 09:00");
  check("daily-1 fires 18 Dec 09:00 Madrid", madrid(plan.find((p) => p.id === "sevilla-daily-1").when), "18/12/2026, 09:00");
  check("big-day AM fires 19 Dec 09:00 Madrid", madrid(plan.find((p) => p.id === "sevilla-bigday-am").when), "19/12/2026, 09:00");

  const late = planNotifications(new Date("2026-12-15T12:00:00Z"));
  check("late 'now' drops past milestones (no ms-30)", late.some((p) => p.id === "sevilla-ms-30"), false);
  check("late 'now' keeps ms-3", late.some((p) => p.id === "sevilla-ms-3"), true);
  check("stays under the 64-notification cap", late.length <= 64, true);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
