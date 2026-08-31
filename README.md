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

## 3. Put it on her iPhone (remote, over a video call)

Her phone is a different iCloud account, so the Mac sync can't reach it. Instead
there's a **one-tap installer** that downloads everything from this repo. Best
done together on a video call — it takes ~5 minutes.

**Send her, ahead of the call:**
- A link to install **Scriptable** (free, App Store).
- The contents of **`Install Sevilla.js`** (one script). Paste it into a message,
  or share the file — whatever survives your chat app intact. (Raw link:
  `https://raw.githubusercontent.com/lukitas06/sevilla-countdown/main/Install%20Sevilla.js`)

**On the call, walk her through:**
1. Install **Scriptable** and open it once (so it sets up its folder).
2. Tap **+** (top-right) → paste the `Install Sevilla` script → tap the title,
   rename it **Install Sevilla** → **Done**.
3. Run it (**▶**). It downloads the 6 countdown files and shows **"¡Listo!"**
   when done. (If any file fails — usually a flaky connection — just run it
   again; it re-fetches.)
4. Run **Sevilla Setup** (**▶**) → **Allow** notifications → she sees the days
   left and "¡Todo listo!".
5. Add the widget: long-press her home screen → **+** (top-left) → search
   **Scriptable** → **small** → **Add** → long-press it → **Edit Widget** →
   **Script → "Sevilla Widget"**.

Done — the reunion countdown is on her home screen, and notifications are set.

> **Updating it later** (e.g. you change the arrival date): push the change to
> the repo, then have her re-run **Install Sevilla** and **Sevilla Setup**. The
> installer overwrites the files with the latest, and Setup re-schedules.

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
