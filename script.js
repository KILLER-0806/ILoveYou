const CONFIG = {
  tag: "Happy Valentine’s Day",
  title: "Chúc mừng Valentine 'Bà IU'",
  sub: "Quá khứ để nhìn lại -  Hiện tại để vun đắp - Tương lai để cố gắng",
  burstMessage: "Chúc 'Bà IU' một Valentine thật ngọt ngào",
  burstLine: "Mong hiện tại và tương lai hai ta sẽ luôn luôn thành công và có yêu thương ở bên!",
  musicSrc: "assets/music.mp3",
};

const $ = (s) => document.querySelector(s);

// ===== DOM
$("#tag").textContent = CONFIG.tag;
$("#title").textContent = CONFIG.title;
$("#sub").textContent = CONFIG.sub;
$("#burstLine").textContent = CONFIG.burstLine;
$("#tag2").textContent = CONFIG.tag;

const reveal = $("#reveal");
const burstText = $("#burstText");
const autoplayNote = $("#autoplayNote");

const openBtn = $("#openBtn");
const replayBtn = $("#replayBtn");
const moreHeartsBtn = $("#moreHeartsBtn");

const fxBox = $("#fxBox");
const boxFX = $("#boxFX");

const musicBtn = $("#musicBtn");
const bgm = $("#bgm");
bgm.src = CONFIG.musicSrc;

// ===== Music
async function playMusicAuto() {
  try {
    await bgm.play();
    musicBtn.textContent = "Tắt nhạc"; // FIX: Btn -> musicBtn
    musicBtn.setAttribute("aria-pressed", "true");
    autoplayNote.hidden = true;
  } catch (err) {
    autoplayNote.hidden = false;
    musicBtn.textContent = "Bật nhạc";
    musicBtn.setAttribute("aria-pressed", "false");
  }
}

async function toggleMusic() {
  try {
    if (bgm.paused) {
      await bgm.play();
      musicBtn.textContent = "Tắt nhạc";
      musicBtn.setAttribute("aria-pressed", "true");
      autoplayNote.hidden = true;
    } else {
      bgm.pause();
      musicBtn.textContent = "Bật nhạc";
      musicBtn.setAttribute("aria-pressed", "false");
    }
  } catch (err) {
    autoplayNote.hidden = false;
  }
}

musicBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleMusic();
});

playMusicAuto();

let triedOnGesture = false;
function ensureMusicOnFirstGesture() {
  if (triedOnGesture) return;
  triedOnGesture = true;
  if (bgm.paused) playMusicAuto();
}
addEventListener("pointerdown", ensureMusicOnFirstGesture, { once: true });
addEventListener("keydown", ensureMusicOnFirstGesture, { once: true });
// ===== Burst text
function setBurstText(text) {
  burstText.innerHTML = "";
  [...text].forEach((ch, i) => {
    const sp = document.createElement("span");
    sp.innerHTML = (ch === " ") ? "&nbsp;" : ch;
    sp.style.animationDelay = (i * 0.028) + "s";
    burstText.appendChild(sp);
  });
}

// ===== State
let opened = false;
let densityTarget = 20;

// ===== Center heart SVG (no pulse animation in CSS)
const centerHeart = $("#centerHeart");
function centerHeartSVG() {
  return `
  <svg viewBox="0 0 200 200" role="img" aria-label="Center Heart">
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff3b7a"/>
        <stop offset="0.55" stop-color="#ff7aa8"/>
        <stop offset="1" stop-color="#b07cff"/>
      </linearGradient>
      <filter id="cglow">
        <feGaussianBlur stdDeviation="4" result="b"/>
        <feMerge>
          <feMergeNode in="b"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g class="pulse" filter="url(#cglow)">
      <path fill="url(#cg)"
        d="M100 170
           C 25 125, 15 80, 40 55
           C 60 35, 85 45, 100 65
           C 115 45, 140 35, 160 55
           C 185 80, 175 125, 100 170 Z"/>
      <path fill="rgba(255,255,255,.55)"
        d="M72 66 C 56 64, 48 76, 52 92 C 58 116, 82 132, 98 144
           C 74 128, 58 110, 56 92 C 54 78, 62 68, 72 66 Z"/>
    </g>
  </svg>`;
}
if (centerHeart) centerHeart.innerHTML = centerHeartSVG();

// ===== Hearts canvas
const heartsCanvas = $("#hearts");
const hctx = heartsCanvas.getContext("2d");
let HW, HH, HDPR;
const hearts = [];

function resizeHearts() {
  HDPR = Math.max(1, Math.min(2, devicePixelRatio || 1));
  HW = heartsCanvas.width = Math.floor(innerWidth * HDPR);
  HH = heartsCanvas.height = Math.floor(innerHeight * HDPR);
  heartsCanvas.style.width = innerWidth + "px";
  heartsCanvas.style.height = innerHeight + "px";
}
addEventListener("resize", resizeHearts);
resizeHearts();

function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  const t = s * 0.30;
  ctx.moveTo(x, y + t);
  ctx.bezierCurveTo(x, y, x - s/2, y, x - s/2, y + t);
  ctx.bezierCurveTo(x - s/2, y + (s+t)/2, x, y + (s+t)/2, x, y + s);
  ctx.bezierCurveTo(x, y + (s+t)/2, x + s/2, y + (s+t)/2, x + s/2, y + t);
  ctx.bezierCurveTo(x + s/2, y, x, y, x, y + t);
  ctx.closePath();
}

function spawnHeart(x = Math.random() * HW, y = HH + 30, extra = {}) {
  const size = (10 + Math.random() * 22) * HDPR;
  hearts.push({
    x, y,
    vx: (-0.35 + Math.random() * 0.7) * HDPR,
    vy: -(0.65 + Math.random() * 1.35) * HDPR,
    size,
    rot: Math.random() * Math.PI,
    vr: (-0.02 + Math.random() * 0.04),
    a: 0.16 + Math.random() * 0.32,
    hue: 332 + Math.random() * 32,
    life: extra.life ?? 999999,
    fade: extra.fade ?? false,
    wobA: (0.6 + Math.random() * 1.4) * HDPR,
    wobF: 0.018 + Math.random() * 0.020,
    wobP: Math.random() * Math.PI * 2,
  });
}

function burstHearts(n = 18) {
  if (!opened) return;
  const cx = HW * (0.35 + Math.random() * 0.3);
  const cy = HH * (0.35 + Math.random() * 0.3);
  for (let i = 0; i < n; i++) {
    spawnHeart(
      cx + (Math.random() * 140 - 70) * HDPR,
      cy + (Math.random() * 90 - 45) * HDPR,
      { life: 120 + Math.floor(Math.random() * 60), fade: true }
    );
  }
}

for (let i = 0; i < 22; i++) spawnHeart(Math.random() * HW, Math.random() * HH);

function tickHearts() {
  hctx.clearRect(0, 0, HW, HH);

  const g = hctx.createRadialGradient(HW * 0.5, HH * 0.5, 0, HW * 0.5, HH * 0.5, Math.max(HW, HH) * 0.6);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.25)");
  hctx.fillStyle = g;
  hctx.fillRect(0, 0, HW, HH);

  for (let i = hearts.length - 1; i >= 0; i--) {
    const p = hearts[i];
    p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    p.x += Math.sin((Date.now() * p.wobF) + p.wobP) * p.wobA;

    if (p.fade) {
      p.life -= 1;
      p.a = Math.max(0, p.a * 0.992);
    }

    hctx.save();
    hctx.translate(p.x, p.y);
    hctx.rotate(p.rot);
    heartPath(hctx, 0, 0, p.size);
    hctx.fillStyle = `hsla(${p.hue},95%,65%,${p.a})`;
    hctx.fill();
    hctx.restore();

    const out = (p.y < -120 || p.x < -180 || p.x > HW + 180);
    const dead = p.fade && p.life <= 0;
    if (out || dead) hearts.splice(i, 1);
  }

  if (hearts.length < densityTarget && Math.random() < (opened ? 0.65 : 0.25)) spawnHeart();
  requestAnimationFrame(tickHearts);
}
tickHearts();

// ===== Sparkles canvas
const spCanvas = $("#sparkles");
const sctx = spCanvas.getContext("2d");
let SW, SH, SDPR;
const sparkles = [];

function resizeSparkles() {
  SDPR = Math.max(1, Math.min(2, devicePixelRatio || 1));
  SW = spCanvas.width = Math.floor(innerWidth * SDPR);
  SH = spCanvas.height = Math.floor(innerHeight * SDPR);
  spCanvas.style.width = innerWidth + "px";
  spCanvas.style.height = innerHeight + "px";
}
addEventListener("resize", resizeSparkles);
resizeSparkles();

function spawnSparkle(x, y) {
  const a = 0.45 + Math.random() * 0.4;
  sparkles.push({
    x: x * SDPR, y: y * SDPR,
    vx: (-1.2 + Math.random() * 2.4) * SDPR,
    vy: (-2.0 + Math.random() * 2.2) * SDPR,
    r: (1.0 + Math.random() * 2.2) * SDPR,
    hue: (320 + Math.random() * 70),
    a,
    life: 55 + Math.floor(Math.random() * 45),
  });
}

function spawnSparklesBurst(x, y, n = 60) {
  if (!opened) return;
  for (let i = 0; i < n; i++) spawnSparkle(x + (Math.random() * 180 - 90), y + (Math.random() * 120 - 60));
}

function tickSparkles() {
  sctx.clearRect(0, 0, SW, SH);
  const pulse = (!bgm.paused) ? (0.08 + 0.08 * Math.sin(Date.now() / 180)) : 0.06;

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const p = sparkles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.02 * SDPR;
    p.life -= 1;

    const alpha = Math.max(0, (p.life / 90) * p.a);
    sctx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${alpha})`;
    sctx.beginPath();
    sctx.arc(p.x, p.y, p.r * (1 + pulse), 0, Math.PI * 2);
    sctx.fill();

    if (p.life <= 0) sparkles.splice(i, 1);
  }
  requestAnimationFrame(tickSparkles);
}
tickSparkles();

// ===== Shockwave
function shockwave(x, y) {
  const w = document.createElement("div");
  w.className = "shockwave";
  w.style.left = x + "px";
  w.style.top = y + "px";
  document.body.appendChild(w);
  setTimeout(() => w.remove(), 850);
}

// ===== Hearts swirl burst
function burstHeartsSwirl(n, xCSS, yCSS) {
  const cx = xCSS * HDPR;
  const cy = yCSS * HDPR;

  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + (Math.random() * 0.35);
    const sp = (1.9 + Math.random() * 3.2) * HDPR;

    hearts.push({
      x: cx + Math.cos(ang) * (10 + Math.random() * 18) * HDPR,
      y: cy + Math.sin(ang) * (10 + Math.random() * 18) * HDPR,
      vx: Math.cos(ang) * sp + (-0.45 + Math.random() * 0.9) * HDPR,
      vy: Math.sin(ang) * sp * 0.72 - (2.0 + Math.random() * 2.2) * HDPR,
      size: (12 + Math.random() * 30) * HDPR,
      rot: Math.random() * Math.PI,
      vr: (-0.10 + Math.random() * 0.20),
      a: 0.26 + Math.random() * 0.44,
      hue: 312 + Math.random() * 78,
      life: 150 + Math.floor(Math.random() * 90),
      fade: true,
      wobA: (1.0 + Math.random() * 3.2) * HDPR,
      wobF: 0.020 + Math.random() * 0.032,
      wobP: Math.random() * Math.PI * 2,
    });
  }
}

// ===== Fullscreen explosion
function burstHeartsFullScreen() {
  if (!opened) return;

  const x = innerWidth * 0.5;
  const y = innerHeight * 0.5;

  shockwave(x, y);
  spawnSparklesBurst(x, y, 260);
  burstHeartsSwirl(64, x, y);

  for (let k = 0; k < 6; k++) {
    const px = innerWidth * (0.12 + Math.random() * 0.76);
    const py = innerHeight * (0.16 + Math.random() * 0.68);
    spawnSparklesBurst(px, py, 50);
    burstHeartsSwirl(14, px, py);
  }

  for (let i = 0; i < 70; i++) spawnHeart(Math.random() * HW, HH + 40);
}

// ===== Explosion on box
function burstHeartsOnBox(count = 26) {
  if (!opened || !fxBox || !boxFX) return;

  boxFX.innerHTML = "";

  const rect = fxBox.getBoundingClientRect();
  const cx = rect.width * 0.5;
  const cy = rect.height * 0.52;

  shockwave(rect.left + cx, rect.top + cy);
  spawnSparklesBurst(rect.left + cx, rect.top + cy, 140);

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "boxHeart";
    el.textContent = (Math.random() < 0.22) ? "💘" : "♥";

    const size = 14 + Math.random() * 22;
    el.style.left = cx + "px";
    el.style.top = cy + "px";
    el.style.fontSize = size + "px";
    el.style.color = Math.random() < .5 ? "rgba(255,59,122,.95)" : "rgba(176,124,255,.92)";
    el.style.filter = `hue-rotate(${(Math.random() * 30 - 15).toFixed(0)}deg)`;

    const dx = (Math.random() * 280 - 140);
    const dy = (Math.random() * 240 - 170);
    el.style.setProperty("--dx", dx + "px");
    el.style.setProperty("--dy", dy + "px");

    boxFX.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

// ===== Cupid shoot
const cupidAnim = $("#cupidAnim");
let shooting = false;

function playCupidShoot() {
  if (!cupidAnim || shooting) return;
  if (!opened) openExperience();

  shooting = true;

  // hiện tim giữa
  centerHeart?.classList.add("on");

  // restart cupid + arrow animation
  cupidAnim.classList.remove("shoot");
  cupidAnim.classList.add("show");
  void cupidAnim.offsetWidth; // reflow
  cupidAnim.classList.add("shoot");

  // tính đúng thời điểm mũi tên chạm tim theo CSS animation
  const arrow = cupidAnim.querySelector(".arrowFly");
  let impactAt = 700; // fallback

  if (arrow) {
    const cs = getComputedStyle(arrow);

    const toMs = (v) => {
      if (!v) return 0;
      v = v.trim();
      return v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000;
    };

    const delay = (cs.animationDelay || "0s").split(",").map(toMs)[0] || 0;
    const dur   = (cs.animationDuration || "0s").split(",").map(toMs)[0] || 0;

    // % thời gian bay đến vị trí chạm tim (tùy CSS). 0.7 = chạm ở 70% hành trình.
    const IMPACT_RATIO = 0.15;

    impactAt = Math.round(delay + dur * IMPACT_RATIO);
  }

  // nổ đúng lúc chạm
  setTimeout(() => {
    burstHeartsFullScreen();
    burstHeartsOnBox(28);
    centerHeart?.classList.remove("on");
  }, impactAt);

  // dọn cupid
  setTimeout(() => {
    cupidAnim.classList.remove("show", "shoot");
    shooting = false;
  }, Math.max(1900, impactAt + 600));
}

// ===== Open experience
function openExperience() {
  if (opened) return;
  opened = true;

  reveal?.classList.add("on");
  reveal?.setAttribute("aria-hidden", "false");

  setBurstText(CONFIG.burstMessage);

  // boost density a bit after open
  densityTarget = 34;
}

// Buttons
openBtn?.addEventListener("click", openExperience);
replayBtn?.addEventListener("click", playCupidShoot);
moreHeartsBtn?.addEventListener("click", () => burstHearts(18));

// Shortcuts
addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); openExperience(); }
  if (e.key.toLowerCase() === "h") { openExperience(); playCupidShoot(); }
  if (e.key.toLowerCase() === "m") toggleMusic();
});

// Tilt (desktop only)
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
if (fxBox && matchMedia("(hover:hover)").matches) {
  fxBox.addEventListener("mousemove", (e) => {
    const r = fxBox.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = clamp((0.5 - py) * 10, -10, 10);
    const ry = clamp((px - 0.5) * 14, -14, 14);
    fxBox.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  });
  fxBox.addEventListener("mouseleave", () => { fxBox.style.transform = ""; });
}

// Trail hearts
let lastTrailAt = 0;
function spawnCursorHeart(x, y) {
  const el = document.createElement("div");
  el.className = "cursorHeart";
  el.textContent = Math.random() < 0.18 ? "💘" : "♥";
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.fontSize = (12 + Math.random() * 18) + "px";
  el.style.filter = `hue-rotate(${(Math.random() * 30 - 15).toFixed(0)}deg)`;
  el.style.color = Math.random() < .5 ? "rgba(255,59,122,.95)" : "rgba(176,124,255,.92)";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
function trailMove(x, y) {
  const now = performance.now();
  if (now - lastTrailAt < 26) return;
  lastTrailAt = now;

  spawnCursorHeart(x, y);

  if (opened) {
    spawnSparklesBurst(x, y, 6);
    if (Math.random() < 0.18) burstHearts(2);
  }
}
addEventListener("pointermove", (e) => trailMove(e.clientX, e.clientY), { passive: true });
addEventListener("touchmove", (e) => {
  const t = e.touches && e.touches[0];
  if (t) trailMove(t.clientX, t.clientY);
}, { passive: true });
const closeBtn = $("#closeBtn");

function closeExperience() {
  opened = false;
  reveal?.classList.remove("on");
  reveal?.setAttribute("aria-hidden", "true");

  // (tuỳ chọn) giảm mật độ tim khi đóng
  densityTarget = 20;
}

closeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  closeExperience();
});

// ESC để thoát
addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeExperience();
});

