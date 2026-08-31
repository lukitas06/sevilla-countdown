// Sevilla Widget.js — the HOME-screen tile, the LOCK-screen widget, AND the
// tap-to-open celebration.
//
// The SAME file runs in several contexts:
//   • config.runsInWidget === true, family "small"/"medium"/"large"
//       → the colorful home-screen tile
//   • config.runsInWidget === true, family "accessoryRectangular"/"Circular"/
//       "Inline"  → the compact, monochrome LOCK-screen widget
//   • config.runsInWidget === false → user tapped it → full-screen WebView
//
// Add to HOME: long-press home screen → + → Scriptable → pick this script.
// Add to LOCK: lock screen → Customize → Lock Screen → add widgets under the
//   clock → Scriptable → pick this script (choose rectangular/circular/inline).

const core = importModule("SevillaCore");
const cfg = importModule("SevillaConfig");

if (config.runsInWidget) {
  const w = buildWidget(config.widgetFamily || "small");
  Script.setWidget(w);
} else {
  await presentCelebrationOrStatus();
}
Script.complete();

// ─────────────────────────────────────────────────────────────────────────
// WIDGET DISPATCH
// ─────────────────────────────────────────────────────────────────────────

function buildWidget(family) {
  // Lock-screen accessory widgets are monochrome + tiny → their own renderers.
  if (family === "accessoryRectangular") return buildLockRectangular();
  if (family === "accessoryCircular") return buildLockCircular();
  if (family === "accessoryInline") return buildLockInline();
  return buildHomeWidget(family);
}

// ─────────────────────────────────────────────────────────────────────────
// HOME-SCREEN TILE (colorful, static)
// ─────────────────────────────────────────────────────────────────────────

function buildHomeWidget(family) {
  const w = new ListWidget();
  applyBackground(w);
  w.setPadding(14, 16, 14, 16);

  const days = core.daysRemaining();
  const isSmall = family === "small";

  if (days > 0) renderFuture(w, days, isSmall);
  else if (days === 0) renderToday(w);
  else renderAfter(w, days);

  // Ask iOS to reload just after the next Sevilla midnight so the number ticks
  // over. This is a hint — iOS may delay it on low battery / if rarely viewed.
  w.refreshAfterDate = core.nextLocalMidnight();
  return w;
}

// ─────────────────────────────────────────────────────────────────────────
// LOCK-SCREEN WIDGETS (monochrome, compact — iOS tints them a single color, so
// no gradients/backgrounds; keep text short and rely on the system tint)
// ─────────────────────────────────────────────────────────────────────────

// Short glanceable phrase for the current state, e.g. "6 días" / "¡HOY!".
function lockText() {
  const days = core.daysRemaining();
  if (days > 0) return { big: String(days), small: days === 1 ? "día ❤️" : "días ❤️" };
  if (days === 0) return { big: "¡HOY!", small: "❤️" };
  const n = Math.abs(days);
  return { big: "❤️", small: n <= 7 ? "¡juntos!" : `+${n} días` };
}

// IMPORTANT: lock-screen text must be explicitly WHITE. iOS renders accessory
// widgets through a vibrancy/tint layer; Scriptable's default text color comes
// out invisible. Setting Color.white() lets iOS tint it to the wallpaper so it
// actually shows. (Every addText below sets textColor for this reason.)

// Rectangular: the roomiest lock-screen slot → "✈️ 6 días" + subtitle.
function buildLockRectangular() {
  const w = new ListWidget();
  const t = lockText();
  const days = core.daysRemaining();

  const row = w.addStack();
  row.centerAlignContent();
  const plane = row.addText("✈️ ");
  plane.font = Font.mediumSystemFont(14);
  plane.textColor = Color.white();
  const num = row.addText(`${t.big} ${t.small}`);
  num.font = Font.boldSystemFont(15);
  num.textColor = Color.white();

  w.addSpacer(2);
  const sub = w.addText(days > 0 ? `para el reencuentro en ${cfg.city}` : cfg.city);
  sub.font = Font.systemFont(11);
  sub.textColor = Color.white();
  sub.textOpacity = 0.7;
  sub.lineLimit = 1;

  w.refreshAfterDate = core.nextLocalMidnight();
  return w;
}

// Circular: a progress RING that fills as the reunion nears, with the day count
// (or ¡HOY!/❤️) in the center. Drawn as an image so it looks crisp; the ring
// uses the separation progress (startISO → targetISO).
function buildLockCircular() {
  const w = new ListWidget();
  const t = lockText();
  const days = core.daysRemaining();

  // Progress 0..1 of the whole wait; fall back to a full ring on/after the day.
  let frac = core.progressFraction();
  if (frac === null) frac = days <= 0 ? 1 : 0;
  if (days <= 0) frac = 1;

  const img = drawProgressRing(t.big, frac);
  w.backgroundImage = img;
  w.refreshAfterDate = core.nextLocalMidnight();
  return w;
}

// Renders a centered label inside a circular gauge. `frac` (0..1) is how much of
// the bright arc is filled, sweeping clockwise from 12 o'clock. Monochrome so it
// works with iOS's lock-screen tint.
function drawProgressRing(label, frac) {
  const S = 200; // draw big; iOS scales it down into the small circular slot
  const dc = new DrawContext();
  dc.size = new Size(S, S);
  dc.opaque = false;
  dc.respectScreenScale = true;

  const cx = S / 2;
  const cy = S / 2;
  const lineW = 16;
  const r = S / 2 - lineW / 2 - 2;

  // Track: faint full ring.
  dc.setStrokeColor(new Color("#ffffff", 0.28));
  dc.setLineWidth(lineW);
  dc.strokeEllipse(new Rect(cx - r, cy - r, r * 2, r * 2));

  // Progress arc: bright, built from short segments (reliable across versions).
  const clamped = Math.max(0, Math.min(1, frac));
  if (clamped > 0) {
    dc.setStrokeColor(new Color("#ffffff", 0.95));
    dc.setLineWidth(lineW);
    const start = -Math.PI / 2; // 12 o'clock
    const end = start + clamped * Math.PI * 2;
    const steps = Math.max(2, Math.ceil(clamped * 90)); // ~1 seg per 4°
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const a = start + ((end - start) * i) / steps;
      pts.push(new Point(cx + r * Math.cos(a), cy + r * Math.sin(a)));
    }
    const p = new Path();
    p.addLines(pts);
    dc.addPath(p);
    dc.strokePath();

    // Rounded caps: dots at both ends of the arc so it looks finished.
    dc.setFillColor(new Color("#ffffff", 0.95));
    for (const a of [start, end]) {
      const dotR = lineW / 2;
      dc.fillEllipse(new Rect(cx + r * Math.cos(a) - dotR, cy + r * Math.sin(a) - dotR, dotR * 2, dotR * 2));
    }
  }

  // Center label (the day number, or ¡HOY!/❤️).
  const big = label.length <= 2;
  dc.setFont(Font.boldSystemFont(big ? 74 : 46));
  dc.setTextColor(Color.white());
  dc.setTextAlignedCenter();
  const th = big ? 90 : 60;
  dc.drawTextInRect(label, new Rect(0, cy - th / 2, S, th));

  return dc.getImage();
}

// Inline: the one-line slot above the clock → "✈️ 6 días · Sevilla".
function buildLockInline() {
  const w = new ListWidget();
  const days = core.daysRemaining();
  let s;
  if (days > 0) s = `✈️ ${days} ${days === 1 ? "día" : "días"} · ${cfg.city}`;
  else if (days === 0) s = `❤️ ¡Hoy es el reencuentro!`;
  else s = Math.abs(days) <= 7 ? `❤️ ¡Juntos en ${cfg.city}!` : `❤️ +${Math.abs(days)} días juntos`;
  const t = w.addText(s);
  t.font = Font.mediumSystemFont(13);
  t.textColor = Color.white();
  w.refreshAfterDate = core.nextLocalMidnight();
  return w;
}

function renderFuture(w, days, isSmall) {
  const top = w.addText("✈️  " + cfg.city.toUpperCase());
  top.font = Font.semiboldSystemFont(12);
  top.textColor = Color.white();
  top.textOpacity = 0.85;
  w.addSpacer(6);

  const big = w.addText(String(days));
  big.font = Font.boldSystemFont(isSmall ? 58 : 76);
  big.textColor = Color.white();
  big.minimumScaleFactor = 0.5;

  const label = w.addText(days === 1 ? "día para el reencuentro ❤️" : "días para el reencuentro ❤️");
  label.font = Font.mediumSystemFont(14);
  label.textColor = Color.white();
  label.minimumScaleFactor = 0.7;

  // In the final 48h, add a precise "1 d · 6 h" line.
  const p = core.preciseLeft();
  if (p.days <= 1) {
    const fine = w.addText(`${p.days} d · ${p.hours} h`);
    fine.font = Font.systemFont(11);
    fine.textColor = Color.white();
    fine.textOpacity = 0.8;
  }

  w.addSpacer(8);
  addProgressBar(w, isSmall);

  // Belt-and-suspenders: a relative date iOS keeps fresh on its own, even if it
  // doesn't re-run our script. Tiny, at the bottom.
  const rel = w.addDate(core.target);
  rel.applyRelativeStyle();
  rel.font = Font.systemFont(9);
  rel.textColor = Color.white();
  rel.textOpacity = 0.55;
}

function renderToday(w) {
  w.addSpacer();
  const hoy = w.addText("¡HOY!");
  hoy.font = Font.boldSystemFont(46);
  hoy.textColor = Color.white();
  hoy.centerAlignText();
  const sub = w.addText("¡Hoy es el reencuentro! 🥹");
  sub.font = Font.semiboldSystemFont(15);
  sub.textColor = Color.white();
  sub.centerAlignText();
  const tap = w.addText("tocá para celebrar 🎉");
  tap.font = Font.systemFont(11);
  tap.textColor = Color.white();
  tap.textOpacity = 0.85;
  tap.centerAlignText();
  w.addSpacer();
}

function renderAfter(w, days) {
  const nights = Math.abs(days);
  w.addSpacer();
  if (nights <= 7) {
    const t = w.addText("¡Juntos! 🇪🇸");
    t.font = Font.boldSystemFont(34);
    t.textColor = Color.white();
    t.centerAlignText();
    const s = w.addText("disfrútenlo ❤️");
    s.font = Font.mediumSystemFont(14);
    s.textColor = Color.white();
    s.centerAlignText();
  } else {
    const t = w.addText("❤️");
    t.font = Font.boldSystemFont(40);
    t.centerAlignText();
    const s = w.addText(`${nights} días juntos`);
    s.font = Font.semiboldSystemFont(16);
    s.textColor = Color.white();
    s.centerAlignText();
  }
  w.addSpacer();
}

function addProgressBar(w, isSmall) {
  const frac = core.progressFraction();
  if (frac === null) return;
  const innerWidth = isSmall ? 120 : 280; // approx inner width; stacks don't expose parent size
  const bar = w.addStack();
  bar.size = new Size(innerWidth, 8);
  bar.cornerRadius = 4;
  bar.backgroundColor = new Color("#ffffff", 0.25);
  const fill = bar.addStack();
  fill.size = new Size(Math.max(2, Math.round(innerWidth * frac)), 8);
  fill.cornerRadius = 4;
  fill.backgroundColor = new Color("#ffffff", 0.95);
}

function applyBackground(w) {
  const img = cfg.photoFileName ? loadPhoto(cfg.photoFileName) : null;
  if (img) {
    w.backgroundImage = img;
    // Darken a touch so white text stays legible over any photo.
    const overlay = new LinearGradient();
    overlay.locations = [0, 1];
    overlay.colors = [new Color("#000000", 0.15), new Color("#000000", 0.45)];
    w.backgroundGradient = overlay;
  } else {
    const g = new LinearGradient();
    g.locations = [0, 1];
    g.colors = [new Color(cfg.gradientTop), new Color(cfg.gradientBottom)];
    w.backgroundGradient = g;
  }
}

function loadPhoto(name) {
  try {
    const fm = FileManager.iCloud();
    const path = fm.joinPath(fm.documentsDirectory(), name);
    if (fm.fileExists(path)) {
      if (fm.isFileStoredIniCloud(path) && !fm.isFileDownloaded(path)) {
        // best-effort; may not be downloaded yet on first render
        fm.downloadFileFromiCloud(path);
      }
      return fm.readImage(path);
    }
  } catch (e) {
    /* fall back to gradient */
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// TAP → full-screen WebView (celebration on the day, status before)
// ─────────────────────────────────────────────────────────────────────────

async function presentCelebrationOrStatus() {
  const days = core.daysRemaining();
  const html = days <= 0 ? celebrationHTML() : statusHTML(days);
  const wv = new WebView();
  await wv.loadHTML(html);
  await wv.present(true); // fullscreen
}

// Read the local, offline confetti library so the big day works with no
// internet. Returns "" if the file is missing (the emoji-rain fallback covers).
function confettiLib() {
  try {
    const fm = FileManager.iCloud();
    const path = fm.joinPath(fm.documentsDirectory(), "_confetti.min.js");
    if (fm.fileExists(path)) {
      if (fm.isFileStoredIniCloud(path) && !fm.isFileDownloaded(path)) {
        fm.downloadFileFromiCloud(path);
      }
      return fm.readString(path);
    }
  } catch (e) {
    /* fall back to emoji rain */
  }
  return "";
}

function celebrationHTML() {
  const city = escapeHtml(cfg.city);
  const top = cfg.gradientTop;
  const bottom = cfg.gradientBottom;
  const lib = confettiLib();

  return `<!doctype html><html><head><meta charset="utf8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>
  html,body{margin:0;height:100%;overflow:hidden;
    background:linear-gradient(160deg,${top},${bottom});
    font-family:-apple-system,system-ui,sans-serif;color:#fff;text-align:center}
  .wrap{height:100%;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:14px;padding:24px;box-sizing:border-box}
  .emoji{font-size:15vw;animation:bounce 1.2s ease-in-out infinite}
  .hoy{font-size:24vw;font-weight:800;line-height:1;margin:0;
    text-shadow:0 4px 20px rgba(0,0,0,.25);animation:pop .6s ease-out both}
  .msg{font-size:6.5vw;font-weight:600;opacity:.96;margin:0}
  .sub{font-size:4.5vw;font-weight:500;opacity:.8;margin:0}
  button{margin-top:10px;padding:14px 22px;border:0;border-radius:24px;
    font-size:5vw;background:#fff;color:${bottom};font-weight:700;
    box-shadow:0 6px 18px rgba(0,0,0,.2)}
  @keyframes pop{from{transform:scale(.2);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
</style></head><body>
<div class="wrap">
  <div class="emoji">✈️❤️🇪🇸</div>
  <h1 class="hoy">¡HOY!</h1>
  <p class="msg">Hoy es el reencuentro en ${city}</p>
  <p class="sub">se acabó la espera 🥹❤️</p>
  <button id="snd">🔊 sonido</button>
</div>
<audio id="a" preload="auto" src="https://actions.google.com/sounds/v1/crowds/battle_crowd_celebrate.ogg"></audio>
<script>${lib}</script>
<script>
  function emojiRain(){
    for(var i=0;i<70;i++){(function(i){
      var s=document.createElement('div');
      s.textContent=['🎉','❤️','✈️','🇪🇸','🥹','🎊'][i%6];
      s.style.cssText='position:fixed;top:-40px;font-size:30px;left:'+(Math.random()*100)+
        'vw;transition:transform 4.2s linear,opacity 4.2s;pointer-events:none;z-index:9';
      document.body.appendChild(s);
      requestAnimationFrame(function(){
        s.style.transform='translateY(115vh) rotate('+(Math.random()*720-360)+'deg)';
        s.style.opacity='0';});
      setTimeout(function(){s.remove();},4400);
    })(i);}
  }
  function boom(){
    if(typeof confetti!=='function'){emojiRain();return;}
    var end=Date.now()+5000;
    (function frame(){
      confetti({particleCount:6,angle:60,spread:72,origin:{x:0}});
      confetti({particleCount:6,angle:120,spread:72,origin:{x:1}});
      if(Date.now()<end)requestAnimationFrame(frame);
    })();
    confetti({particleCount:200,spread:110,startVelocity:45,origin:{y:.6}});
  }
  document.getElementById('snd').onclick=function(){
    var a=document.getElementById('a');a.muted=false;a.currentTime=0;
    a.play().catch(function(){});boom();
  };
  // Fire visuals immediately; sound waits for a tap (iOS autoplay rule).
  window.addEventListener('load',function(){boom();setInterval(boom,3500);});
</script></body></html>`;
}

function statusHTML(days) {
  const city = escapeHtml(cfg.city);
  const top = cfg.gradientTop;
  const bottom = cfg.gradientBottom;
  const p = core.preciseLeft();
  const frac = core.progressFraction();
  const pct = frac === null ? null : Math.round(frac * 100);
  const label = days === 1 ? "día para el reencuentro ❤️" : "días para el reencuentro ❤️";

  return `<!doctype html><html><head><meta charset="utf8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>
  html,body{margin:0;height:100%;overflow:hidden;
    background:linear-gradient(160deg,${top},${bottom});
    font-family:-apple-system,system-ui,sans-serif;color:#fff;text-align:center}
  .wrap{height:100%;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:10px;padding:28px;box-sizing:border-box}
  .plane{font-size:12vw;margin-bottom:4px}
  .num{font-size:38vw;font-weight:800;line-height:.95;margin:0;
    text-shadow:0 4px 20px rgba(0,0,0,.22)}
  .lbl{font-size:6vw;font-weight:600;margin:0;opacity:.96}
  .fine{font-size:4.5vw;opacity:.8;margin:6px 0 0}
  .city{font-size:5vw;font-weight:700;letter-spacing:.15em;opacity:.9;
    margin-top:14px;text-transform:uppercase}
  .track{width:70%;height:10px;border-radius:6px;background:rgba(255,255,255,.28);
    margin-top:18px;overflow:hidden}
  .fill{height:100%;border-radius:6px;background:#fff;width:${pct === null ? 0 : pct}%}
  .pct{font-size:3.5vw;opacity:.75;margin-top:8px}
</style></head><body>
<div class="wrap">
  <div class="plane">✈️</div>
  <h1 class="num">${days}</h1>
  <p class="lbl">${label}</p>
  <p class="fine">${p.days} d · ${p.hours} h · ${p.mins} min</p>
  <div class="city">${city}</div>
  ${pct === null ? "" : `<div class="track"><div class="fill"></div></div><div class="pct">${pct}% del camino recorrido</div>`}
</div></body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
