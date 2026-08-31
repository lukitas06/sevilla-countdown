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
  // Arrival: 13 Dec 2026. Time is a placeholder (only affects the precise
  // "X d · Y h" line in the last 48h — the day-count flips at Sevilla midnight).
  // Update the 14:30 to the real flight-arrival time when you know it.
  targetISO: "2026-12-13T14:30:00+01:00",

  // Optional: when the countdown "started" (e.g. the day she flew to Sevilla,
  // or the day you booked). Only used to draw the progress bar. Set to null to
  // hide the bar. Also uses an explicit offset — Aug in Spain is CEST/+02:00.
  startISO: "2026-08-01T00:00:00+02:00",

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
