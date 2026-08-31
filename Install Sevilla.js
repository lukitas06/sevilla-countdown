// Install Sevilla.js — one-tap installer for the Sevilla reunion countdown.
//
// ▶ HOW TO USE (on the phone that will get the countdown):
//   1. Install "Scriptable" from the App Store (free) and open it once.
//   2. Tap + (top-right) to create a new script, paste THIS whole file in.
//   3. Rename it "Install Sevilla" (tap the title). Tap Done.
//   4. Run it (▶). It downloads all the countdown files for you.
//   5. When it finishes, run "Sevilla Setup", then add the "Sevilla Widget"
//      widget to the home screen.
//
// It fetches the other scripts from the public GitHub repo and writes them into
// this Scriptable folder, so you don't have to paste six files by hand.

const REPO = "https://raw.githubusercontent.com/lukitas06/sevilla-countdown/main";

// Files to install (real names on disk; spaces get URL-encoded when fetching).
const FILES = [
  "SevillaConfig.js",
  "SevillaCore.js",
  "Sevilla Widget.js",
  "Sevilla Notifications.js",
  "Sevilla Setup.js",
  "_confetti.min.js",
];

const fm = FileManager.iCloud();
const dir = fm.documentsDirectory();

async function run() {
  const results = [];
  for (const name of FILES) {
    const url = `${REPO}/${encodeURIComponent(name)}`;
    try {
      const req = new Request(url);
      req.timeoutInterval = 30;
      const text = await req.loadString();
      const status = req.response ? req.response.statusCode : 200;
      if (status >= 400 || !text) throw new Error(`HTTP ${status}`);
      fm.writeString(fm.joinPath(dir, name), text);
      results.push({ name, ok: true });
    } catch (e) {
      results.push({ name, ok: false, err: String(e) });
    }
  }

  const good = results.filter((r) => r.ok).length;
  const bad = results.filter((r) => !r.ok);

  const a = new Alert();
  if (bad.length === 0) {
    a.title = "¡Listo! ✈️❤️";
    a.message =
      `Se instalaron ${good} archivos.\n\n` +
      `Ahora:\n1) Corré el script "Sevilla Setup" (permití notificaciones).\n` +
      `2) Agregá el widget: mantené presionada la pantalla → + → Scriptable → ` +
      `tamaño chico → "Editar Widget" → elegí "Sevilla Widget".`;
  } else {
    a.title = "Casi… ⚠️";
    a.message =
      `Se instalaron ${good}/${FILES.length}.\n\nFallaron:\n` +
      bad.map((b) => `• ${b.name} (${b.err})`).join("\n") +
      `\n\nRevisá la conexión y volvé a correr este script.`;
  }
  a.addAction("OK");
  await a.present();
}

await run();
Script.complete();
