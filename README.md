# Cuenta regresiva a Sevilla ✈️❤️

A home-screen countdown **for your girlfriend's iPhone** in Sevilla: a widget
that shows how many days until you arrive, notifications as the day nears, and a
full-screen **confetti celebration** on the big day.

Built with [Scriptable](https://scriptable.app) (free) — a JavaScript runtime
for iOS that renders **real home-screen widgets**. No Xcode, no Apple Developer
account, no App Store.

---

## Deployment: what you do and don't need

This is the whole reason for choosing Scriptable. To put this on **any** iPhone
(yours to test, hers for real), you need **none** of the usual iOS app hoops:

| Not needed ❌ | Why |
|--------------|-----|
| Apple Developer account ($99/yr) | Scriptable runs your JS as personal automation. |
| App Store submission / review | Nothing is "published" — files just live in the app. |
| Xcode / a build step | The scripts are plain `.js`, edited in any editor. |
| Code signing / provisioning profiles | No native binary is produced. |
| TestFlight | No beta distribution — you copy files directly. |

**All that's required:** the free **Scriptable** app installed on the iPhone,
the files copied into it, run `Sevilla Setup` once, add the widget.

The only real "cost": setup happens **on the physical phone** (you can't remote-
install). For her phone, do it in person or over a video call — it's ~5 minutes.

---

## Files

| File | What it is |
|------|-----------|
| `SevillaConfig.js` | **The only file you normally edit** — date, names, colors, photo. |
| `SevillaCore.js` | Countdown math (Sevilla-timezone / DST correct). |
| `Sevilla Widget.js` | The home-screen tile; on tap opens the celebration/status screen. |
| `Sevilla Notifications.js` | Schedules all the notifications (idempotent). |
| `Sevilla Setup.js` | Run once to schedule everything + shows setup instructions. |
| `_confetti.min.js` | The confetti library, bundled so the big day works **offline**. |

All six must live together in Scriptable's folder. Filenames must match
**exactly** (the scripts load each other by name).

---

## 1. Personalize (before handoff)

Open `SevillaConfig.js` and set:

- **`targetISO`** — your real arrival in Sevilla, e.g. `"2026-12-19T14:30:00+01:00"`.
  Keep the `+01:00` — December in Spain is CET (UTC+1).
- **`you`** — your name (what *she* sees: "…para ver a **Lucas**").
- **`startISO`** *(optional)* — when the countdown "starts" (e.g. the day she
  flew out), for the progress bar. Aug in Spain is `+02:00`. Set `null` to hide.
- **`photoFileName`** *(optional)* — drop a photo of you two into the Scriptable
  folder (e.g. `us.jpg`) and put `"us.jpg"` here to use it as the widget
  background. `null` = the red gradient.

Everything else (notification times, colors) has sensible defaults.

---

## 2. Test it on YOUR iPhone first (via iCloud Drive)

Test the real widget + notifications on your own phone before the handoff. The
smoothest path uses iCloud Drive (already active on this Mac), so files you edit
in this repo sync to Scriptable on your phone.

1. **Install Scriptable** (free) on your iPhone, signed into your iCloud. **Open
   it once** — that creates its iCloud folder.
2. **Sync the files from this repo:**
   ```bash
   ./sync-to-scriptable.sh
   ```
   This copies the scripts + `_confetti.min.js` into
   `~/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/`. They
   appear in Scriptable on your phone within seconds. (Re-run it whenever you
   edit — git stays the source of truth.)
3. **Run `Sevilla Setup`** in Scriptable → **allow notifications** → you'll see
   the days-left alert.
4. **Add the widget:** long-press the home screen → **+** → **Scriptable** →
   **small** → **Add** → long-press it → **Edit Widget** → **Script → "Sevilla
   Widget"**. Confirm the day-count looks right.
5. **Fire a real notification fast (don't wait for a real milestone):** in
   `SevillaConfig.js` temporarily set `dailyNudgeHour` (and minute) to ~2 minutes
   from now, re-sync, re-run `Sevilla Setup`, and wait for it to arrive. Then
   **revert**.
6. **See the celebration:** temporarily set `targetISO` to *yesterday*, re-sync,
   tap the widget → confetti + sound button. Then **revert**.

Off-device, you can also run the automated checks and preview the screens in a
browser — see [`test/`](test/):
```bash
node test/test-core.js && node test/test-notif.js
node test/gen-preview.js && open celebration-preview.html status-preview.html
```

---

## 3. Put it on her iPhone (the handoff)

1. **Install Scriptable** from the App Store (free). Open it once.
2. **Get the files in.** Easiest options:
   - **AirDrop** all six files to her phone → open each in Scriptable, or
   - Put them in a **shared iCloud folder** you both access, or
   - Just **paste** each one into a new script (tap **+** in Scriptable), naming
     each script exactly as the filename (without `.js`), e.g. `SevillaConfig`,
     `Sevilla Widget`, and the confetti one as `_confetti.min`.

   > The confetti file `_confetti.min.js` isn't a script you run — it just needs
   > to sit in the same Scriptable folder. AirDrop/iCloud is easiest for it.
3. **Run `Sevilla Setup` once.** Tap it in Scriptable's list → tap ▶. It will
   ask for **notification permission** — allow it. You'll see "¡Todo listo!"
   with the days left.
4. **Add the widget to her home screen:** long-press the home screen → **+**
   (top-left) → search **Scriptable** → pick the **small** size → **Add** →
   long-press the new widget → **Edit Widget** → **Script → "Sevilla Widget"**.

Done. The tile now shows the live countdown, and notifications are scheduled.

> On her phone (a different iCloud account), `sync-to-scriptable.sh` won't reach
> it — use AirDrop, a shared iCloud folder, or paste the files in manually.

---

## 4. How it behaves

- **Every day** it shows the number of days left, ticking over at **midnight in
  Sevilla**.
- **Notifications:** a "buenos días, faltan N días" nudge each morning for the
  final two weeks, plus milestone pings at 30 / 14 / 7 / 3 / 1 days, and a
  **midnight blast** the moment the big day begins.
- **On the day:** the tile flips to **¡HOY!**. Tapping it opens a full-screen
  **confetti** celebration (tap **🔊 sonido** for the cheer — iOS blocks
  auto-playing sound without a tap).
- **After:** it shows "Con Lucas 🇪🇸" for the first week, then a "días juntos"
  counter.

---

## Good to know (honest limits)

- **The tile itself doesn't animate** — iOS home-screen widgets are static
  snapshots. The confetti/sound live in the screen that opens **on tap**.
- **Refresh timing is iOS's call.** The day-number usually updates by morning; a
  self-updating relative line ("in 3 days") is shown as a backup.
- **Notifications are pre-scheduled** when you run Setup. For a fixed date this
  covers the whole countdown — **you only need to run Setup once** (re-run only
  if you change the date). They won't fire if the phone is off at that exact
  minute, and Focus/Do-Not-Disturb can silence them.
- **Confetti works offline** because the library is bundled (`_confetti.min.js`).

---

## Changing the date later

Edit `targetISO` in `SevillaConfig.js`, then run `Sevilla Setup` again. That's
it — old notifications are cleared and re-scheduled automatically.

## Testing the celebration now

Temporarily set `targetISO` to *yesterday* in `SevillaConfig.js`, tap the
widget to see the confetti, then **set it back**.
