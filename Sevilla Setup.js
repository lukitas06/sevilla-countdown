// Sevilla Setup.js — run this ONCE to wire everything up.
//
// It schedules the whole notification batch and shows a friendly summary with
// how many days are left and how to add the widget. Safe to run again anytime
// (re-scheduling is idempotent).

const scheduleAll = importModule("Sevilla Notifications");
const core = importModule("SevillaCore");
const cfg = importModule("SevillaConfig");

const days = core.daysRemaining();
const res = await scheduleAll();

const a = new Alert();
a.title = "¡Todo listo! ✈️";
a.message =
  `Faltan ${days} ${days === 1 ? "día" : "días"} para el reencuentro en ${cfg.city} ❤️.\n\n` +
  `📅 ${res.scheduled} notificaciones agendadas.\n\n` +
  `Para ver la cuenta regresiva siempre a mano:\n` +
  `mantené presionada la pantalla de inicio → tocá "+" arriba → buscá ` +
  `"Scriptable" → elegí el tamaño chico → y en "Editar Widget" seleccioná ` +
  `el script "Sevilla Widget".`;
a.addAction("¡Dale!");
await a.present();

Script.complete();
