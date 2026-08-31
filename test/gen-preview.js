// Regenerate the celebration + status HTML previews from the SHIPPING code,
// so you can open them in a browser.
// Run from the repo root:  node test/gen-preview.js
// Then:                    open celebration-preview.html status-preview.html
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const CONFIG = require(path.join(ROOT, "SevillaConfig.js"));
globalThis.__SEVILLA_CONFIG__ = CONFIG;
const core = require(path.join(ROOT, "SevillaCore.js"));

// Pull the real HTML builders out of the widget source (from confettiLib to EOF),
// then override confettiLib to read the bundled file directly (no FileManager).
const src = fs.readFileSync(path.join(ROOT, "Sevilla Widget.js"), "utf8");
const body = src.slice(src.indexOf("function confettiLib"));

const wrapped = `
  ${body}
  confettiLib = function(){ return require("fs").readFileSync(${JSON.stringify(path.join(ROOT, "_confetti.min.js"))},"utf8"); };
  return { celebrationHTML, statusHTML };
`;
const make = new Function("cfg", "core", "require", wrapped);
const { celebrationHTML, statusHTML } = make(CONFIG, core, require);

// Celebration uses the live config as-is.
fs.writeFileSync(path.join(ROOT, "celebration-preview.html"), celebrationHTML());

// For the status page, pin a representative "6 days out" view.
const realDR = core.daysRemaining,
  realPL = core.preciseLeft;
core.daysRemaining = () => 6;
core.preciseLeft = () => ({ days: 6, hours: 4, mins: 12, ms: 0 });
fs.writeFileSync(path.join(ROOT, "status-preview.html"), statusHTML(6));
core.daysRemaining = realDR;
core.preciseLeft = realPL;

const cel = fs.readFileSync(path.join(ROOT, "celebration-preview.html"), "utf8");
const st = fs.readFileSync(path.join(ROOT, "status-preview.html"), "utf8");

let ok = true;
const a = (cond, msg) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`);
  if (!cond) ok = false;
};

a(cel.includes("¡HOY!"), "celebration contains ¡HOY!");
a(cel.includes(`Hoy es el reencuentro en ${CONFIG.city}`), "celebration has the reunion message + city");
a(cel.includes("t.confetti=e.exports"), "confetti library is embedded inline");
a(cel.includes("function boom()"), "boom() launcher present");
a(cel.includes("emojiRain"), "emoji-rain fallback present");
a((cel.match(/<script>/g) || []).length === 2, "exactly two <script> tags");
a(st.includes(">6<"), "status shows the day number 6");
a(st.includes(`>${CONFIG.city}<`), "status shows the city text");
a(st.includes("del camino recorrido"), "status shows progress caption");

console.log(`\ncelebration-preview.html: ${cel.length} bytes`);
console.log(`status-preview.html:      ${st.length} bytes`);
console.log(ok ? "\nALL HTML CHECKS PASSED" : "\nSOME CHECKS FAILED");
process.exit(ok ? 0 : 1);
