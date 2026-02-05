'use strict';

/* ──────────────────────────────────────────────────────────
   1. PHYSICS MOMENTUM SCROLL
   Uses requestAnimationFrame with exponential velocity decay.
────────────────────────────────────────────────────────── */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window);
  if (prefersReduced || isTouch) return;

  let targetY = window.scrollY;
  let currentY = window.scrollY;
  let rafId = null;

  const ACCEL = 0.18;

  function tick() {
    const delta = targetY - currentY;
    currentY += delta * ACCEL;
    window.scrollTo(0, currentY);

    if (Math.abs(delta) > 0.5) {
      rafId = requestAnimationFrame(tick);
    } else {
      currentY = targetY;
      window.scrollTo(0, currentY);
      rafId = null;
    }
  }

  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scrollAmount = e.deltaY * (e.deltaMode === 1 ? 30 : 1);
    targetY = Math.max(0, Math.min(
      document.documentElement.scrollHeight - window.innerHeight,
      targetY + scrollAmount
    ));

    if (!rafId) {
      currentY = window.scrollY;
      rafId = requestAnimationFrame(tick);
    }
  }, { passive: false });

  window.addEventListener('scroll', () => {
    if (!rafId) {
      targetY = window.scrollY;
      currentY = window.scrollY;
    }
  }, { passive: true });
})();


/* ──────────────────────────────────────────────────────────
   2. NAVBAR SCROLL EFFECT
────────────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}


/* ──────────────────────────────────────────────────────────
   3. HAMBURGER MENU
────────────────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ──────────────────────────────────────────────────────────
   4. SMOOTH ANCHOR SCROLL
────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 68;
    window.dispatchEvent(new WheelEvent('wheel', {
      deltaY: top - window.scrollY,
      deltaMode: 0,
      bubbles: true,
      cancelable: true
    }));
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


/* ──────────────────────────────────────────────────────────
   5. INTERSECTION OBSERVER — REVEAL + COUNTERS
────────────────────────────────────────────────────────── */
const countersDone = new Set();

function animateCounter(el, target, suffix = '') {
  if (countersDone.has(el)) return;
  countersDone.add(el);
  const start = performance.now();
  const duration = 1200 + Math.random() * 400;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const progress = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(progress * target) + suffix;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');

    if (entry.target.closest('.stats-grid')) {
      document.querySelectorAll('[data-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target), el.id?.startsWith('stat2') ? '+' : '');
      });
    }
    if (entry.target.closest('.arch-grid') || entry.target.classList.contains('arch-card')) {
      document.querySelectorAll('.arch-num[data-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ──────────────────────────────────────────────────────────
   6. HERO TERMINAL DYNAMIC RENDERER
────────────────────────────────────────────────────────── */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, prefersReduced ? 0 : ms));

  // How long a fully-rendered fetch stays on screen before it clears and
  // the next themed art types in. (2500ms)
  const HOLD_MS = 2500;

  // GLOBAL SIZE CONTROLS
  const TERMINAL_WIDTH = 1050;

  const asciiEl = document.getElementById('ascii');
  const artInfo = document.getElementById('artInfo');
  const infoRowsEl = document.getElementById('infoRows');
  const cmdLine = document.getElementById('cmdLine');
  const typedCmd = document.getElementById('typedCmd');
  const cmdCaret = document.getElementById('cmdCaret');
  const idlePrompt = document.getElementById('idlePrompt');
  const typedClear = document.getElementById('typedClear');
  const idleCaret = document.getElementById('idleCaret');
  const termBody = document.getElementById('termBody');
  const root = document.documentElement;

  if (!asciiEl || !artInfo || !infoRowsEl || !termBody) return;

  root.style.setProperty('--terminal-width', TERMINAL_WIDTH + 'px');

  // ART STORAGE — 7 ascii arts
  function buildArt1() {
    const N = 16, HALF = 8;
    const lines = [];
    for (let r = 0; r < HALF; r++) lines.push('#'.repeat(N) + ' ' + '<'.repeat(N));
    for (let r = 0; r < HALF; r++) lines.push('>'.repeat(N) + ' ' + '#'.repeat(N));
    return lines.join('\n');
  }

  const ART2 =
    `⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠁⢀⣀⡀⠙⢿⣿⣿⣿⣿⣿⣿
⣿⣿⡿⠉⠀⠉⠉⠉⠙⠛⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⣠⣾⠿⠛⢻⡆⠈⢿⣿⣿⣿⣿⣿
⣿⣿⡇⠀⢘⣛⣛⠳⠶⠖⠀⢀⣉⣉⣭⣤⣤⣄⣀⣉⠁⠀⠜⣫⣶⣿⣿⣦⢹⡄⠈⣿⣿⣿⣿⣿
⣿⣿⡇⠀⣿⣿⡟⠁⣠⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⢼⣿⣿⣿⣿⣿⡄⣧⠀⢿⣿⣿⣿⣿
⣿⣿⣧⠀⢿⠋⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⣄⡉⠛⠿⣿⡧⣿⠀⢸⣿⣿⣿⣿
⣿⣿⣿⡀⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣤⡀⠋⠀⣿⣿⣿⣿⣿
⣿⣿⣿⠇⢠⣿⣿⣿⠋⢹⣿⣿⣿⣿⣿⣿⣿⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣄⠈⢿⣿⣿⣿⣿
⣿⣿⡏⠀⣾⣿⣿⠏⣀⠸⣿⣿⣿⣿⣿⣿⣿⡄⠈⢿⣿⡟⢻⣿⣿⣿⣿⣿⢿⣿⣆⠈⣿⣿⣿⣿
⣿⣿⠁⢰⣿⡿⠋⠀⠛⡀⢻⣿⣿⣿⣿⣿⣿⣇⠀⠈⢿⣧⠘⣿⣿⣿⣿⣿⠈⠻⣿⡄⠸⣿⣿⣿
⣿⣿⡄⠸⣿⡇⢸⣿⣿⣿⡄⠻⣿⣿⣿⣿⣿⠛⢐⣷⡄⠻⡄⢻⣿⣿⣿⣿⠀⢀⠈⢳⠀⢻⣿⣿
⣿⡿⠇⠀⣿⡇⢈⠉⠉⢻⣿⣦⣤⣤⣤⣤⣤⣼⠟⠉⠻⣦⣀⠘⣿⣿⣿⡟⠀⡆⠄⢸⣇⠀⢻⣿
⡏⠀⡠⠀⢋⣡⣿⣧⡀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⢸⣿⠀⢿⡿⠋⣀⠀⠙⠀⣼⣿⡆⠈⣿
⣿⡀⠀⣾⣿⣿⣿⣿⣿⣿⣿⡟⠿⠿⢿⣿⢿⣿⣿⣿⣿⣿⣿⠀⣤⣤⣾⣿⠀⢠⣾⣿⣿⡿⠀⣽
⣿⡟⠀⡈⠛⠿⣿⣿⣿⣿⣿⣿⣶⣶⣶⣤⣶⣿⣿⣿⣿⣿⡟⢀⡏⢠⣄⣡⣤⠘⠟⠙⠿⠁⣰⣿
⣿⡇⠀⣿⣷⡆⢀⣤⡉⢉⡉⠛⠛⠛⠛⠛⠛⠛⠛⠉⣉⠀⣤⣈⡁⠘⠟⢀⡀⢠⣴⣤⣴⣾⣿⣿
⣿⠁⠘⠛⠉⠠⣾⣿⡇⠸⠇⣆⠘⠟⢁⣤⡈⠛⢁⠀⡏⢠⣿⣿⣿⠀⣴⣾⡷⠀⠻⣿⣿⣿⣿⣿
⣿⣿⣿⠃⢰⣄⡀⠉⠛⠀⠀⣿⣷⡶⠀⣿⡇⠰⣿⠀⣷⠈⠛⠛⠉⢀⣉⣁⣴⠶⠀⠙⠿⣿⣿⣿
⣿⣿⠃⢀⠸⣿⣿⣦⣄⡀⠀⣿⣿⡇⠸⣿⣿⠄⣿⠀⣿⠀⣠⣴⣾⣿⣿⡿⢁⣴⣶⣦⠀⢹⣿⣿
⣿⣿⡄⠘⣦⡈⠛⠙⣿⡇⠀⢻⣿⣿⣶⣌⠁⣰⣿⡆⠁⢸⣿⣿⣦⣤⣉⠁⢾⣿⣿⣿⠃⢸⣿⣿
⣿⣿⣿⣦⣤⣤⠄⢠⣿⠃⠀⠸⠿⠿⠿⢿⣿⣿⣿⠇⠀⠸⣿⣿⣿⣿⣿⣷⡤⠈⣉⣀⣴⣿⣿⣿
⣿⣿⣿⣿⣿⡟⠀⠺⠟⠀⣤⣴⣶⣶⣤⣄⣤⣤⣤⣤⣴⣄⠘⢿⠿⠟⡋⣁⣶⠀⠹⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠃⢰⣶⠀⢠⣾⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣦⣀⠀⠳⣾⣿⣿⣷⠀⢹⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠀⠸⠟⠀⠀⢉⣉⣉⠉⠀⠈⢉⠉⠉⠉⠉⢉⣉⣉⡀⠀⢨⠿⠛⠁⣠⣾⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣷⣦⣤⡄⠀⢸⣿⣿⠀⢠⣤⣈⣉⣁⡀⠘⣾⣿⣿⠇⢀⣀⣠⣶⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠈⠙⠛⢀⣿⣿⣿⣿⣿⣿⡀⠘⠛⠃⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿`;

  const ART3 =
    `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⡖⠿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣞⡻⠉⢀⠀⠈⠳⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡏⠀⡂⣸⣦⠀⠀⠘⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⢻⠉⠻⠐⣭⡀⠀⠙⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⢡⠤⠜⠂⠀⠀⠈⠘⠀⠀⠀⠱⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⠞⠁⠙⢦⣀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠈⠣⡀⠀⠀⠀⠀⠀⠀⠀⣂⠤⠤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⡀⠀⠀⠀⠉⠳⣄⠀⠀⣹⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣼⣶⣶⢒⣛⡻⢥⡤⣀⠀⢮⡗⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢰⣶⣿⣿⣿⣾⣧⣤⣬⣤⣀⣙⣿⣤⣽⡆⠂⠂⡀⠀⠀⠀⠀⣀⠀⠠⠐⠂⠈⡋⣟⣿⣇⣠⡀⡼⣏⣉⡉⠱⣿⣿⣶⣶⠒⠒⠒⠒⠒⠒⠒⠒⠢⠤⢄⡀
⠀⠀⠀⠀⠉⠉⢛⣿⢿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠂⠂⠀⠉⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣿⣷⣶⣶⣶⣶⣶⣶⣾⣿⠿⠛⠁
⠀⠀⠀⠀⠀⠀⠈⠛⢻⣿⣿⣿⣿⡏⢁⣀⣀⣠⣤⣤⡤⠀⢀⠀⠀⢀⡀⣀⣠⣤⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⢿⠟⠛⠋⠉⠉⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⡿⠿⠛⠛⠉⠀⠀⠒⢾⠤⠤⠤⠀⠚⠛⠉⢩⠙⠛⠛⠟⠿⣿⡿⢿⡿⣿⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣀⣿⣿⠟⢻⠁⠀⠀⢀⣀⣀⣀⣀⠤⠀⠀⠀⠀⠀⢀⣤⡤⠼⣴⣤⣤⣤⣤⣿⡿⠿⠛⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠠⢶⣶⣶⣿⣦⣤⣠⣿⣿⣶⣾⣿⣶⣿⣿⠿⠿⠛⠁⠀⠀⠀⠀⠤⠤⠶⠿⢿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠉⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⠿⠿⠿⠿⢙⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⠟⢿⣿⣿⣿⣿⡿⢻⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣸⡇⠀⣿⣿⣿⣿⠟⠀⢸⠋⠀⠀⠀⠀⠠⣤⣀⣄⣴⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⡟⠀⢠⣿⣿⡟⠁⠀⠀⡸⠁⠀⠠⠀⠀⠁⠀⢉⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⠀⠀⣼⡟⠁⠀⠀⠀⢠⡇⢀⢄⡞⠀⠀⡳⣴⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⠙⠚⠋⠀⠀⠀⠀⢀⣾⠇⠡⠈⠀⠀⢀⣾⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠿⡆⠀⠀⢀⣴⠏⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣷⣶⣾⡇⠀`;

  const ART4 = `⠀⠀⠀⠀⡾⢿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⢀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣸⠇⠀⢿⣿⣿⣿⣿⢧⡀⢀⣴⠞⣻⡿⢋⣽⡷⠄⠀⣀⣀⣠⣤⣴⣶⣶
⠀⠀⠀⣿⠀⠀⠀⣿⣿⡿⠿⠟⢓⣈⠋⣸⣋⠐⠉⢥⣴⣾⣿⣿⣿⣿⡿⠟⠛⠉
⠀⠀⠀⣿⠀⠀⠀⠘⣡⣴⣶⡿⣿⣿⣿⣿⣿⣿⣷⠶⢌⠙⠛⠋⠉⠀⣠⣤⡀⠀
⠀⠀⠀⢿⠀⠀⣠⣾⣿⣿⡟⢸⡏⢿⣿⣿⣿⣿⡇⢰⠲⣤⣀⡀⢠⣾⡟⠁⣇⣾
⠀⠀⠀⠸⣂⣼⣿⣿⣿⣿⡇⢻⣷⡈⢿⣿⣿⣿⣿⠸⡄⠘⡿⢿⡿⡿⢳⣼⡟⠋
⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⢱⣄⠙⢿⣄⠙⣿⣿⣿⡄⣿⣿⣿⣌⣑⣇⣼⠛⢙⡂
⣤⣶⠏⣼⡿⣿⣿⣿⣿⡿⠈⣿⣷⣦⣤⣤⡇⠸⣿⠀⣝⡀⠀⣹⣿⣿⣷⡔⣪⡇
⣿⣿⣼⣿⢁⣿⣿⡿⠟⣡⣆⠹⣿⣿⣿⣿⡇⣄⠸⣧⠐⠿⠇⠻⠋⣉⣉⣁⣉⠀
⣿⣿⢸⣯⣘⣉⢀⣴⡾⠿⢿⣆⠙⢿⠿⣿⠃⣿⣦⡈⠻⡆⣶⣾⣿⣿⢻⣿⣿⣆
⠈⡛⠸⣿⣿⣿⢸⡟⢀⡀⢸⣿⣷⣦⣦⣌⣠⠏⠉⢻⣦⢀⣿⣿⣿⡏⣸⣿⣿⣿
⠀⠀⠀⠹⣿⣿⠘⢳⢬⢥⣿⣿⣿⣿⣿⣿⣿⠀⣤⢸⠃⣼⣿⣿⠟⡇⣿⣿⣿⡿
⠀⠀⠀⡦⢌⠉⠀⠀⠙⠛⠿⠿⠩⣭⣥⠙⣿⣹⢒⠎⣴⣿⣿⠋⡜⣠⣍⠉⠀⠀
⠀⠀⢀⠔⠊⠉⠙⡉⠉⢶⡄⠀⠠⢤⣤⠤⠄⠀⠀⠘⠛⣋⣡⡤⠔⠃⠞⠀⠀⠀
⠀⠀⡪⠀⠀⠀⠀⠀⠀⡘⠁⠚⠃⢠⡄⡐⠻⠆⠀⠿⠂⢀⡀⠀⠀⠀⠀⠀⠀⠀`;

  const ART5 = `⠀⠀⠀⠀ ⣾⣿⣿⣿⣿⣷⢸⣿⣿⡜⢯⣷⡌⡻⣿⣿⣿⣷⣦⣤⣀
⠀⠀⠀⠀ ⡁⢳⣿⣿⣿⣿⣿⣿⡜⣿⣿⣧⢀⢻⣷⠰⠈⢿⣿⣿⣧⢣⠉⠑⠪⠿⠿⠋⠁⠀
⠀⠀⢀⣱⡇⡞⣿⣿⣿⣿⣿⣿⡇⣿⣿⡏⡄⣧⠹⡇⠧⠈⢻⣿⣿⡇⢧⢢⠀⠀⠑⠀⠀⠀⠀⠀⠀⠀ 
⠀⠀⢸⣿⣇⢃⢿⣿⣿⣿⣿⣿⣷⣿⣿⠇⢃⣡⣤⡹⠐⣿⣀⢻⣿⣿⢸⡎⠳⡄⠀⠀⠀⠀⠀⠀
⠀⠈⣾⣿⣿⠘⡸⣿⣿⣿⣿⣿⣿⣿⡿⣰⣿⣿⢟⡷⠈⠋⠃⠎⢿⣿⡏⣿⠀⠘⢆⠀⠀⠀⠀⠀
⠀⡐⢹⣿⣿⡐⢡⢹⣿⣿⣿⣿⡏⣿⢣⣿⣿⡑⠁⠔⠀⠉⠉⠢⡘⣿⡇⣿⡇⠀⡀⠡⡀⠀⠀⠀⠀
⠀⡇⠘⣿⣿⣇⠇⢣⢻⣿⣿⣿⡇⢇⣾⣿⣿⡆⢸⣤⡀⠚⢂⠀⢡⢿⡇⣿⡇⠀⢿⠀⠀⠄⠀⠀⠀
⠀⣿⠠⠹⣿⣿⡘⣆⢣⠻⣿⣿⢈⣾⣿⣿⣿⣶⣸⣏⢀⣬⣋⡼⣠⢸⢹⣿⡇⢠⣼⠙⡄⠀⠀⠀⠀⠀
⠀⢹⡇⠁⠹⣿⣇⠹⡃⠃⠙⡇⠘⢿⣿⣿⣿⣿⣿⣏⣓⣉⣭⣴⣿⠘⢸⣿⠁⠘⠋⠀⠹⠄⠀⠀⠀⠀
⠀⠈⢷⠀⠀⠈⢿⣇⠂⣷⠄⠐⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢠⢸⡏⠀⢀⣠⣴⣾⣿⣶⣄⠀⠀
⠀⠀⠈⢆⠀⠀⠀⠙⠆⠈⠢⠲⠥⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡞⣸⠁⠀⢸⣿⣿⣿⣿⣿⣿⡆
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠄⠃⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⡏⠹⣿⣿⡿⠫⠊⠀⠀⠀⣶⠀⢻⣿⣿⣿⣿⡿⡇⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠻⠿⠿⠿⢋⠀⠀⠀⠀⢀⣼⣿⡆⠈⣿⣿⣿⡟⣱⡷⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢁⣁⡀⠨⣛⠿⠶⠄⢀⣠⣾⣿⣿⣷⠀⢹⣿⡟⣴⠈⢃⣶⠔⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⡄⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠈⣿⣿⡿⠀⡀⣿⣷⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢙⠻⣿⣿⢀⠙⠻⠿⣿⣿⣿⣿⣿⣿⡇⠁⣿⠟⡀⠈⣧⢰⣿⠆⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠿⠴⠮⣥⠻⢧⣤⣄⣀⡉⢩⣭⣍⣃⣀⣩⠎⢀⣼⠉⣼⡯⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⠁⣛⠓⢒⣒⣢⡭⢁⡈⠿⠿⠟⠹⠛⠁⠀⠀⠀⠰⠃⠂⠀⠀⠀`;

  const ART6 = `⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⢈⢿⠿⠿⠿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣛⣅⠠⢂⣿⣿⣿⣿⣿⣿⣿⣷⣮⣽⡛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⢋⣵⣾⣿⣿⣦⣾⣿⣿⣿⣿⣿⣿⢻⣿⣿⣿⣿⣷⣌⡻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡟⣱⣿⣿⣹⣿⡏⢼⣿⣯⢻⣿⡍⣿⣼⡄⣿⣿⣿⢻⣿⣿⣷⣎⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣇⠉⠻⠅⡸⢻⣿⢸⣿⡏⡅⣎⠻⣿⣧⡹⣷⢹⣿⣇⣿⣿⣿⢸⣿⣿⣿⣏⣧⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣦⡀⢰⡇⣿⣿⢸⣿⡇⠁⡿⠗⠈⢻⣷⡜⠸⣿⣿⢹⣿⣿⢸⣿⣿⣿⣿⣿⣇⢻⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡇⣼⡇⢻⡇⢸⢿⡇⡀⢰⣿⠿⠆⠙⢿⡀⣿⣿⢸⣿⣿⢸⣿⣿⣿⣿⣿⣿⡜⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠃⢻⣷⢸⣷⠀⠀⠃⠡⠈⣁⠀⠀⢀⣶⡄⣿⣿⢸⣿⣿⢀⣠⡈⢻⣿⣿⣿⢧⢻⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⢸⠸⡇⡀⢿⣸⣄⣶⣇⣰⠟⣠⣶⣿⣿⣿⢻⣿⣀⣿⣿⠀⢿⣿⢸⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠀⠀⠁⠈⠘⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⡿⢀⡼⠃⣾⣿⣿⣼⣿⡇⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡄⢄⡐⠄⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡈⣿⣿⣿⡇⢘⢱⡇⣼⣿⣿⡟⡿⠇⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡇⢸⡇⣶⣘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⣿⣿⣿⡇⢸⢸⡇⣿⣿⣿⡇⢷⠀⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡇⣼⡇⢿⣿⣿⣿⡿⢟⣋⣥⣿⣿⣿⣿⣿⡇⣿⣿⣿⡇⢸⡇⡇⢿⣿⣿⣷⢸⡄⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣧⢹⣿⡸⣿⣿⣏⣴⣿⣿⣿⣿⣿⣿⣿⣿⡗⣿⣿⣿⡇⣼⣷⢸⢸⣿⣿⣿⡎⡇⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠀⣿⣷⡝⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢿⣲⣿⣿⣿⠀⣿⣿⡞⣎⣿⣿⣿⣇⢣⢸⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠀⣿⣿⣿⠂⡹⣿⣿⣿⣿⣿⠟⣭⣾⣶⡿⢹⣿⣿⠀⢻⣿⣇⢻⣿⣿⣿⣿⡸⣸⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⢻⣿⣿⠀⣿⣬⣛⣫⣭⣄⢸⡿⢋⣥⣶⢸⣿⣿⢘⡸⣿⣿⡎⢿⣿⣿⣿⣧⠁⢿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇挤⣿⡏⠀⢻⢹⣿⣿⣿⣿⡈⣴⣿⣿⣿⢸⣿⡿⣾⡷⣈⡉⠛⢈⠛⠛⡛⢛⣡⣬⣭⣙⡻⢿⣿
⣿⣿⣿⣿⣿⣿⡇⣿⣿⡇⢸⢸⡾⣿⣿⣿⡿⡄⣿⣿⣿⣿⢸⣿⡇⣿⣜⡛⠿⠡⢰⣶⢎⣴⣿⣿⣿⣿⣿⣿⣦⢹
⣿⣿⣿⣿⣿⣿⡇⣿⣿⢡⣿⡞⡇⢿⣿⠿⢃⣿⡌⣿⣿⣿⢸⣿⢰⣿⡿⠁⠀⠁⠠⢣⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄
⣿⣿⣿⣿⣿⣿⡇⣿⡟⣸⣿⣷⡸⢈⠅⡀⣰⢡⣮⣥⣶⡿⣿⡟⣾⠟⠀⠀⠄⠠⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀
⣿⣿⣿⣿⣿⣿⠀⣿⢧⡿⠟⣡⠶⣊⠞⣰⣿⡘⣿⣿⣿⠇⣿⠁⠃⠶⠶⠲⢀⢢⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⣿⡿⠋⢀⡟⣰⠶⠊⣡⣾⢏⢼⣿⣿⡧⢛⣋⡭⣸⡟⠀⢿⠶⠋⠀⠀⢾⣿⡏⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆
⣿⣿⣿⡿⣱⡇⢸⠇⠁⠀⠀⠿⠋⡎⠸⢛⣥⣾⡿⣿⠃⣻⢀⣴⣶⣾⡇⢤⡀⣮⡛⢳⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⢡⡿⠱⡘⠠⠀⢀⣴⣿⣿⣶⣾⣿⠟⠁⣠⠇⢠⡇⣾⣿⣿⣿⣇⢸⡇⢻⡇⣼⣿⡿⠟⣛⣛⣛⣫⣝⢿⠇
⣿⣿⠇⣿⢇⡇⢠⠉⢀⣾⣿⣿⣿⣿⣿⣿⣶⣿⡟⠀⣿⢡⣿⣿⣿⣿⢸⠀⣇⠀⠁⣿⣿⣿⣦⣭⣭⣍⠳⠟⡳⠄
⣿⣿⢰⣿⠸⣡⣾⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡀⡄⣿⢸⣿⣿⣿⣿⠈⢸⣿⡄⡆⢻⣿⣿⣿⣿⣿⣿⣷⣾⣿⠃
⣿⡏⡿⢣⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⡇⠡⢻⢸⣿⣿⣿⣿⢀⢸⣿⣇⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢠
⣿⢡⢡⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠻⣿⡇⡇⣤⣦⣄⣿⣿⣿⣿⡜⢸⣿⣿⢸⡞⣿⣿⣿⣿⣿⢿⣿⣿⣿⢸
⣿⡌⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⢀⣿⣿⢡⢿⣿⣿⣿⣿⣿⣿⣧⢁⢻⣿⢸⡇⣿⣿⣿⣿⢃⣾⣿⣿⡟⣼
⡇⡇⣿⠁⠀⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠸⣿⣿⣿⣿⣿⣿⣿⣧⠀⠹⢸⢹⣿⣿⠿⢣⣾⣿⣿⣿⡇⢹`;

  const ART7 =
    `⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⢟⣥⣶⣷⣿⣯⢄⠈⠳⠄⢩⡛⠿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠃⢩⣾⡮⢝⣭⣤⣭⣭⣭⠀⠀⠱⠱⢈⢿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⢟⠅⠀⢩⠴⣶⣶⣽⣟⡻⣿⣿⣷⣄⠃⡇⢈⠘⣿⣿⣿⣿⣿⣿
⣿⣿⡏⣼⡏⠁⢀⣠⣄⠙⣏⢿⣿⣷⣭⣿⣶⡄⠠⢹⢷⢸⣿⣿⣿⣿⣿
⣿⣿⢠⡏⡄⢰⣿⣿⣿⣷⡜⠪⢍⡉⠉⠙⠋⠥⠂⠀⠛⡎⣿⣿⣿⣿⣿
⣿⣿⡜⢸⠁⢊⣭⣭⢽⣿⣷⣦⡀⠈⣅⠀⠀⠀⢠⠠⢠⢡⢹⣿⣿⣿⣿
⣿⣿⠇⡎⠀⠀⢠⡆⣄⢻⣿⣿⣇⠷⢛⡦⠁⠀⢀⠀⠙⣾⣆⠻⣿⣿⣿
⣭⡅⡌⠁⢄⠀⢀⠡⣬⣾⢿⣿⡿⣯⠛⠁⠎⠀⠀⠀⢠⣿⣿⣿⡄⠉⣿
⣿⣏⡣⢄⠀⠓⠀⠡⡹⣿⡷⠿⢛⣿⣾⡈⠀⠀⠀⣠⡇⣿⠻⢿⡏⢰⣿
⣿⣿⣿⡇⣀⠂⠀⠀⠈⠚⠿⣷⣾⡿⠋⠀⡴⠃⠇⣿⠇⢋⣠⣿⠇⣸⣿
⣿⡿⣫⠞⠁⢠⡆⠆⠀⠀⠀⠀⠁⠐⠀⠀⠁⠠⢰⣷⡾⠟⣛⣥⡆⣿⣿
⡿⠈⡱⢰⣇⡈⠳⣶⠀⠀⠀⠀⠀⠀⣴⣶⠄⡀⠈⠻⠁⢸⡻⠸⣱⣿⣿
⣿⣷⣬⢸⢡⢸⡏⡇⠀⢀⠠⢑⣥⣾⣿⢋⣴⠟⢁⣤⣦⣄⠀⣼⣿⣿⣿
⣿⣿⣿⣦⣬⣄⡁⠀⢀⣷⣤⣿⡿⢛⣴⡿⠃⣰⣿⣿⣿⣿⣷⢸⣿⣿⣿
⣿⣿⣿⣿⣿⡿⠋⢰⣿⡿⠟⢡⣶⣿⣟⠄⣼⣿⣿⣿⣿⣿⣿⣼⣿⣿⣿
⣿⣿⣿⡟⣩⣶⡇⢛⣁⣄⣶⡕⣡⠎⣹⠀⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⢸⣿⣿⣷⣿⣿⣿⠏⣴⣿⢰⣿⣷⡘⢂⢻⣿⣿⣿⣿⡏⣿⣿⣿
⣿⣿⣿⡆⢿⣿⢹⡟⢿⢋⣾⣿⣿⣿⣿⣿⣷⡀⢸⣿⣿⣿⣿⡇⣿⣿⣿
⣿⣿⣿⣿⡜⣿⡏⢿⢀⢿⡄⣿⣿⣧⢻⣦⢻⡳⠸⣿⣿⣿⣿⡇⣿⣿⣿
⣿⣿⣿⣿⣧⠈⡛⢈⢾⣮⠳⠻⠿⣿⡎⣿⢦⢷⠀⣿⣿⣿⣿⣷⢹⣿⣿
⣿⣿⣿⣿⣿⡇⠀⠀⠰⠿⢷⡑⠹⣿⣿⡸⣾⠈⢀⣿⣿⣿⣿⣿⢸⣿⣿
⣿⣿⣿⣿⣿⡇⢠⠄⢀⡀⣀⠀⠀⠀⠀⠀⡀⠀⣿⠘⣿⣿⣿⣿⢸⣿⣿
⣿⣿⣿⣿⣿⠁⠘⢀⣿⣷⣿⢰⣿⡌⣆⢿⣿⣄⠹⡄⣿⣿⣿⣿⣸⣿⣿
⣿⣿⣿⣿⡇⠂⣷⣿⣿⡏⣿⢸⣿⣿⢹⣌⢏⢻⣷⠀⢹⡿⣿⣿⡇⣿⣿
⣿⣿⣿⣿⠃⣤⢣⣿⣿⣿⣿⣼⣿⣿⣿⣿⡌⣧⠹⢷⠸⣷⡘⣿⡇⢸⣿
⣿⣿⣿⡏⢰⡏⣼⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣾⣷⠀⠀⣿⣿⣼⣧⡌⣿
⣿⣿⣿⠃⣼⢳⡏⢿⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⢹⣿⣿⣿⣇⢸`;

  // Clean raw art strings without byte glitching
  const CLEAN_ART6 = `
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⢈⢿⠿⠿⠿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣛⣅⠠⢂⣿⣿⣿⣿⣿⣿⣿⣷⣮⣽⡛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⢋⣵⣾⣿⣿⣦⣾⣿⣿⣿⣿⣿⣿⢻⣿⣿⣿⣿⣿⣿⡻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡟⣱⣿⣿⣹⣿⡏⢼⣿⣯⢻⣿⡍⣿⣼⡄⣿⣿⣿⢻⣿⣿⣷⣎⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣇⠉⠻⠅⡸⢻⣿⢸⣿⡏⡅⣎⠻⣿⣧⡹⣷⢹⣿⣇⣿⣿⣿⢸⣿⣿⣿⣏⣧⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣦⡀⢰⡇⣿⣿⢸⣿⡇⠁⡿⠗⠈⢻⣷⡜⠸⣿⣿⢹⣿⣿⢸⣿⣿⣿⣿⣿⣇⢻⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡇⣼⡇⢻⡇⢸⢿⡇⡀⢰⣿⠿⠆⠙⢿⡀⣿⣿⢸⣿⣿⢸⣿⣿⣿⣿⣿⣿⡜⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠃⣿⣷⢸⣷⠀⠀⠃⠡⠈⣁⠀⠀⢀⣶⡄⣿⣿⢸⣿⣿⢀⣠⡈⢻⣿⣿⣿⢧⢻⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⢸⠸⡇⡀⢿⣸⣄⣶⣇⣰⠟⣠⣶⣿⣿⣿⢻⣿⣀⣿⣿⠀⢿⣿⢸⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠀⠀⠁⠈⠘⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⡿⢀⡼⠃⣾⣿⣿⣼⣿⡇⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡄⢄⡐⠄⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡈⣿⣿⣿⡇⢘⢱⡇⣼⣿⣿⡟⡿⠇⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡇⢸⡇⣶⣘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⣿⣿⣿⡇⢸⢸⡇⣿⣿⣿⡇⢷⠀⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡇⣼⡇⢿⣿⣿⣿⡿⢟⣋⣥⣿⣿⣿⣿⣿⡇⣿⣿⣿⡇⢸⡇⡇⢿⣿⣿⣷⢸⡄⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣧⢹⣿⡸⣿⣿⣏⣴⣿⣿⣿⣿⣿⣿⣿⣿⡗⣿⣿⣿⡇⣼⣷⢸⢸⣿⣿⣿⡎⡇⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠀⣿⣷⡝⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢿⣲⣿⣿⣿⠀⣿⣿⡞⣎⣿⣿⣿⣇⢣⢸⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠀⣿⣿⣿⠂⡹⣿⣿⣿⣿⣿⠟⣭⣾⣶⡿⢹⣿⣿⠀⢻⣿⣇⢻⣿⣿⣿⣿⡸⣸⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⢻⣿⣿⠀⣿⣬⣛⣫⣭⣄⢸⡿⢋⣥⣶⢸⣿⣿⢘⡸⣿⣿⡎⢿⣿⣿⣿⣧⠁⢿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⢹⣿⡏⠀⢻⢹⣿⣿⣿⣿⡈⣴⣿⣿⣿⢸⣿⡿⣾⡷⣈⡉⠛⢈⠛⠛⡛⢛⣡⣬⣭⣙⡻⢿⣿
⣿⣿⣿⣿⣿⣿⡇⣿⣿⡇⢸⢸⡾⣿⣿⣿⡿⡄⣿⣿⣿⣿⢸⣿⡇⣿⣜⡛⠿⠡⢰⣶⢎⣴⣿⣿⣿⣿⣿⣿⣦⢹
⣿⣿⣿⣿⣿⣿⡇⣿⣿⢡⣿⡞⡇⢿⣿⠿⢃⣿⡌⣿⣿⣿⢸⣿⢰⣿⡿⠁⠀⠁⠠⢣⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄
⣿⣿⣿⣿⣿⣿⡇⣿⡟⣸⣿⣷⡸⢈⠅⡀⣰⢡⣮⣥⣶⡿⣿⡟⣾⠟⠀⠀⠄⠠⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀
⣿⣿⣿⣿⣿⣿⠀⣿⢧⡿⠟⣡⠶⣊⠞⣰⣿⡘⣿⣿⣿⠇⣿⠁⠃⠶⠶⠲⢀⢢⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⣿⡿⠋⢀⡟⣰⠶⠊⣡⣾⢏⢼⣿⣿⡧⢛⣋⡭⣸⡟⠀⢿⠶⠋⠀⠀⢾⣿⡏⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆
⣿⣿⣿⡿⣱⡇⢸⠇⠁⠀⠀⠿⠋⡎⠸⢛⣥⣾⡿⣿⠃⣻⢀⣴⣶⣾⡇⢤⡀⣮⡛⢳⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⢡⡿⠱    ⢀⣴⣿⣿⣶⣾⣿⠟⠁⣠⠇⢠⡇⣾⣿⣿⣿⣇⢸⡇⢻⡇⣼⣿⡿⠟⣛⣛⣛⣫⣝⢿⠇
⣿⣿⠇⣿⢇⡇⢠⠉⢀⣾⣿⣿⣿⣿⣿⣿⣶⣿⡟⠀⣿⢡⣿⣿⣿⣿⢸⠀⣇⠀⠁⣿⣿⣿⣦⣭⣭⣍⠳⠟⡳⠄
⣿⣿⢰⣿⠸⣡⣾⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡀⡄⣿⢸⣿⣿⣿⣿⠈⢸⣿⡄⡆⢻⣿⣿⣿⣿⣿碎⣾⣿⠃
⣿⡏⡿⢣⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⡇⠡⢻⢸⣿⣿⣿⣿⢀⢸⣿⣇⢹⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⢠
⣿⢡⢡⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠻⣿⡇⡇⣤⣦⣄⣿⣿⣿⣿⡜⢸⣿⣿⢸⡞⣿⣿⣿⣿⣿⢿⣿⣿⣿⢸
⣿⡌⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⢀⣿⣿⢡⢿⣿⣿⣿⣿⣿⣿⣧⢁⢻⣿⢸⡇⣿⣿⣿⣿⢃⣾⣿⣿⡟⣼
⡇⡇⣿⠁⠀⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿.`;

  const THEMES = [
    {
      name: 'Sky Meadow',
      art: buildArt1(),
      gradient: 'linear-gradient(155deg, #38bdf8 0%, #38bdf8 45%, #86efac 100%)',
      accent: '#38bdf8', accentRGB: '56,189,248'
    },
    {
      name: 'Ember Drift',
      art: ART2,
      gradient: 'linear-gradient(150deg, #e879f9 0%, #60a5fa 35%, #f472b6 65%, #c9cddb 100%)',
      accent: '#e879f9', accentRGB: '232,121,249'
    },
    {
      name: 'Violet Sky',
      art: ART3,
      gradient: 'linear-gradient(150deg, #a78bfa 0%, #60a5fa 50%, #c9cddb 100%)',
      accent: '#60a5fa', accentRGB: '96,165,250'
    },
    {
      name: 'Rose Ash',
      art: ART4,
      gradient: 'linear-gradient(150deg, #f472b6 0%, #f2726b 50%, #c9cddb 100%)',
      accent: '#f472b6', accentRGB: '244,114,182'
    },
    {
      name: 'Neon Bloom',
      art: ART5,
      gradient: 'linear-gradient(150deg, #e879f9 0%, #60a5fa 35%, #f472b6 65%, #c9cddb 100%)',
      accent: '#e879f9', accentRGB: '232,121,249'
    },
    {
      name: 'Sunset Pastel',
      art: ART6,
      gradient: 'linear-gradient(150deg, #f2924b 0%, #f472b6 35%, #fbcfe8 60%, #c9cddb 100%)',
      accent: '#f472b6', accentRGB: '244,114,182'
    },
    {
      name: 'Deep Forest',
      art: ART7,
      gradient: 'linear-gradient(160deg, #86efac 0%, #86efac 45%, #38bdf8 100%)',
      accent: '#86efac', accentRGB: '134,239,172'
    }
  ];

  let themeIndex = 0;

  function applyTheme(theme) {
    asciiEl.textContent = theme.art;
    root.style.setProperty('--art-gradient', theme.gradient);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-rgb', theme.accentRGB);
    fitAsciiBlock();
  }

  // ---------- data ----------
  const memData = {
    total: 48, free: 26, used: 45,
    banks: [
      { label: 'Memory 0:', used: 45, size: '16GB' },
      { label: 'Memory 1:', used: 45, size: '08GB' },
      { label: 'Memory 2:', used: 45, size: '16GB' },
      { label: 'Memory 3:', used: 45, size: '08GB' },
    ]
  };

  const disks = [
    { type: 'SSD', drive: 'C:', used: 234.20, total: 237.10, pct: 98, fs: 'NTFS', ext: 'Int' },
    { type: 'HDD', drive: 'D:', used: 287.14, total: 465.76, pct: 61, fs: 'NTFS', ext: 'Int' },
    { type: 'USB', drive: 'G:', used: 108.63, total: 112.64, pct: 96, fs: 'NTFS', ext: 'Ext' },
    { type: 'HDD', drive: 'H:', used: 925.86, total: 931.50, pct: 99, fs: 'NTFS', ext: 'Int' },
    { type: 'SSD', drive: 'I:', used: 79.28, total: 110.79, pct: 71, fs: 'NTFS', ext: 'Int' },
    { type: 'HDD', drive: 'Y:', used: 307.79, total: 465.75, pct: 66, fs: 'NTFS', ext: 'Int' },
  ];

  const perf = [
    { drive: 'C:', read: 1240.70, write: 770.78, sn: 'SN-1000', ext: 'Int' },
    { drive: 'D:', read: 75.41, write: 66.31, sn: 'SN-1001', ext: 'Int' },
    { drive: 'G:', read: 150.36, write: 64.16, sn: 'SN-1002', ext: 'Ext' },
    { drive: 'H:', read: 124.15, write: 106.44, sn: 'SN-1003', ext: 'Int' },
    { drive: 'I:', read: 515.14, write: 436.85, sn: 'SN-1004', ext: 'Int' },
    { drive: 'Y:', read: 110.26, write: 84.49, sn: 'SN-1005', ext: 'Int' },
  ];

  const pctClass = p => p >= 90 ? 'pct-high' : p >= 50 ? 'pct-mid' : 'pct-low';
  const typeClass = t => t === 'SSD' ? 'type-ssd' : t === 'HDD' ? 'type-hdd' : 'type-usb';
  const pctField = p => `(${p}%)`.padStart(5);

  function buildMemRows() {
    const rows = [];
    const totalPlain = `~ (Total: ${memData.total} GB) (Free: ${memData.free} GB) (Used: ${memData.used}%)`;
    const totalHtml = `<span class="tilde">~</span>(Total: <b>${memData.total} GB</b>) (Free: <b>${memData.free} GB</b>) (Used: <span class="pct">${memData.used}%</span>)`;
    rows.push({ plain: totalPlain, html: totalHtml });
    memData.banks.forEach(b => {
      const plain = `~ ${b.label.padEnd(10)}(Used: ${String(b.used).padStart(2)}%) ${b.size} DDR4 2133 MHz`;
      const html = `<span class="tilde">~</span>${b.label.padEnd(10)}(Used: <span class="pct">${String(b.used).padStart(2)}%</span>) <b>${b.size}</b> DDR4 2133 MHz`;
      rows.push({ plain, html });
    });
    return rows;
  }

  function buildStorageRows() {
    return disks.map(d => {
      const label = `${d.type} Disk (${d.drive})`.padEnd(14);
      const usedStr = d.used.toFixed(2).padStart(6);
      const totalStr = d.total.toFixed(2).padStart(6);
      const pf = pctField(d.pct);
      const extStr = d.ext.padEnd(3);
      const plain = `${label}[ (Used)   ${usedStr} GiB / ${totalStr} GiB  ${pf} - ${d.fs}  ${extStr} ]`;
      const html = `<span class="${typeClass(d.type)}">${label}</span><span class="bracket">[</span> (Used)   <span class="size">${usedStr} GiB / ${totalStr} GiB</span>  <span class="pct ${pctClass(d.pct)}">${pf}</span> - <span class="fs">${d.fs}</span>  <span class="${d.ext === 'Int' ? 'int' : 'ext'}">${extStr}</span> <span class="bracket">]</span>`;
      return { plain, html };
    });
  }

  function buildPerfRows() {
    return perf.map(p => {
      const label = `Disk (${p.drive})`.padEnd(10);
      const readStr = p.read.toFixed(2).padStart(7);
      const writeStr = p.write.toFixed(2).padStart(7);
      const plain = `${label}[ Read: ${readStr} MB/s | Write: ${writeStr} MB/s | ${p.sn} ${p.ext} ]`;
      const html = `<span class="type-generic">${label}</span><span class="bracket">[</span> <span class="read">Read: ${readStr} MB/s</span> <span class="bracket">|</span> <span class="write">Write: ${writeStr} MB/s</span> <span class="bracket">|</span> <span class="sn">${p.sn} ${p.ext}</span> <span class="bracket">]</span>`;
      return { plain, html };
    });
  }

  function buildLeftHeader(label, targetWidth) {
    const prefix = '~>> ';
    const head = `${prefix}${label} `;
    const dashCount = Math.max(3, targetWidth - head.length - 1);
    const dashes = '-'.repeat(dashCount);
    return {
      plain: `${head}${dashes}*`,
      html: `<span class="prefix">${prefix}</span><span class="hl">${label}</span> ${dashes}*`
    };
  }

  function buildCenteredHeader(label, targetWidth) {
    const inner = ` ${label} `;
    const totalDash = Math.max(4, targetWidth - inner.length);
    const left = Math.floor(totalDash / 2);
    const right = totalDash - left;
    const l = '-'.repeat(left);
    const r = '-'.repeat(right);
    return {
      plain: `${l}${inner}${r}`,
      html: `${l}<span class="hl">${inner}</span>${r}`
    };
  }

  const memContentRows = buildMemRows();
  const memWidth = Math.max(...memContentRows.map(r => r.plain.length));
  const memHeader = buildLeftHeader('Memory Info', memWidth);
  memHeader.isHead = true;
  const memRowsFinal = [memHeader, ...memContentRows];

  const storageContentRows = buildStorageRows();
  const storageWidth = Math.max(...storageContentRows.map(r => r.plain.length));
  const storageHeader = buildCenteredHeader('STORAGE SUMMARY', storageWidth);
  storageHeader.isHead = true;
  const storageRowsFinal = [storageHeader, ...storageContentRows];

  const perfContentRows = buildPerfRows();
  const perfWidth = Math.max(...perfContentRows.map(r => r.plain.length));
  const perfHeader = buildCenteredHeader('DISK PERFORMANCE & DETAILS', perfWidth);
  perfHeader.isHead = true;
  const perfRowsFinal = [perfHeader, ...perfContentRows];

  const BASE_MONO_SIZE = 12;

  function fitMonoBlock(id) {
    const el = document.getElementById(id);
    if (!el || !el.firstElementChild) return;
    el.style.fontSize = BASE_MONO_SIZE + 'px';
    const available = el.clientWidth;
    const needed = el.scrollWidth;
    if (needed > available && available > 0) {
      const fitted = Math.max(7, Math.floor((BASE_MONO_SIZE * (available / needed)) * 100) / 100);
      el.style.fontSize = fitted + 'px';
    }
  }

  function fitAllMonoBlocks() {
    ['memRows', 'storageBody', 'perfBody'].forEach(fitMonoBlock);
  }

  function fitAsciiBlock() {
    if (!asciiEl.textContent) return;
    asciiEl.style.fontSize = '12px';
    const stacked = window.innerWidth <= 760;
    const bodyWidth = termBody.clientWidth || 1;
    const availableWidth = stacked ? bodyWidth - 4 : Math.min(bodyWidth * 0.44, 440);

    const neededWidth = asciiEl.scrollWidth;

    if (neededWidth > availableWidth && availableWidth > 0) {
      const scale = availableWidth / neededWidth;
      const fitted = Math.max(8, Math.floor((12 * scale) * 100) / 100);
      asciiEl.style.fontSize = fitted + 'px';
    }
  }

  let isFullState = false;
  function lockHeight() {
    termBody.style.minHeight = '0px';
    void termBody.offsetHeight;
    const h = termBody.scrollHeight;
    termBody.style.minHeight = h + 'px';
  }

  window.addEventListener('resize', () => {
    if (artInfo.style.display !== 'none') { fitAllMonoBlocks(); fitAsciiBlock(); }
    if (isFullState) lockHeight();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (artInfo.style.display !== 'none') { fitAllMonoBlocks(); fitAsciiBlock(); }
      if (isFullState) lockHeight();
    });
  }

  async function typeText(el, text, min = 40, max = 85) {
    el.textContent = '';
    for (const ch of text) {
      el.textContent += ch;
      await sleep(min + Math.random() * (max - min));
    }
  }

  async function revealBlock(containerId, rowsData, step = 45) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = rowsData.map(row => {
      const cls = row.isHead ? 'mono-row head-row' : 'mono-row';
      return `<div class="${cls}">${row.html}</div>`;
    }).join('');
    fitMonoBlock(containerId);
    const rowEls = Array.from(el.children);
    for (const r of rowEls) {
      r.classList.add('show');
      await sleep(step);
    }
  }

  function resetForTyping() {
    isFullState = false;
    typedCmd.textContent = '';
    cmdCaret.style.display = '';
    artInfo.style.display = 'none';
    asciiEl.classList.remove('show');
    infoRowsEl.querySelectorAll('.info-row').forEach(r => r.classList.remove('show'));
    ['memRows', 'storageBody', 'perfBody'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });
    if (idlePrompt) idlePrompt.style.display = 'none';
    if (typedClear) typedClear.textContent = '';
  }

  async function runCycle() {
    resetForTyping();
    applyTheme(THEMES[themeIndex]);
    themeIndex = (themeIndex + 1) % THEMES.length;

    await typeText(typedCmd, 'binaryfetch');
    cmdCaret.style.display = 'none';
    await sleep(250);

    artInfo.style.display = 'flex';
    fitAsciiBlock();
    asciiEl.classList.add('show');
    const infoRowEls = Array.from(infoRowsEl.querySelectorAll('.info-row'));
    for (const row of infoRowEls) {
      row.classList.add('show');
      await sleep(50);
    }
    await sleep(150);

    await revealBlock('memRows', memRowsFinal);
    await sleep(100);
    await revealBlock('storageBody', storageRowsFinal);
    await sleep(100);
    await revealBlock('perfBody', perfRowsFinal);

    await sleep(300);
    if (idlePrompt) idlePrompt.style.display = 'flex';
    isFullState = true;
    lockHeight();

    await sleep(HOLD_MS);

    if (typedClear) {
      await typeText(typedClear, 'clear');
      await sleep(450);
    }

    runCycle();
  }

  function renderStatic() {
    applyTheme(THEMES[0]);
    themeIndex = 1;
    typedCmd.textContent = 'binaryfetch';
    cmdCaret.style.display = 'none';
    artInfo.style.display = 'flex';
    fitAsciiBlock();
    asciiEl.classList.add('show');
    infoRowsEl.querySelectorAll('.info-row').forEach(r => r.classList.add('show'));

    const fill = (id, rows) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = rows.map(row => {
        const cls = row.isHead ? 'mono-row head-row show' : 'mono-row show';
        return `<div class="${cls}">${row.html}</div>`;
      }).join('');
      fitMonoBlock(id);
    };
    fill('memRows', memRowsFinal);
    fill('storageBody', storageRowsFinal);
    fill('perfBody', perfRowsFinal);

    if (idlePrompt) idlePrompt.style.display = 'flex';
    isFullState = true;
    lockHeight();
  }

  function measureFullHeight() {
    applyTheme(THEMES[0]);
    typedCmd.textContent = 'binaryfetch';
    artInfo.style.display = 'flex';
    fitAsciiBlock();

    const fill = (id, rows) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = rows.map(row => {
        const cls = row.isHead ? 'mono-row head-row' : 'mono-row';
        return `<div class="${cls}">${row.html}</div>`;
      }).join('');
      fitMonoBlock(id);
    };
    fill('memRows', memRowsFinal);
    fill('storageBody', storageRowsFinal);
    fill('perfBody', perfRowsFinal);

    if (idlePrompt) idlePrompt.style.display = 'flex';

    termBody.style.minHeight = '0px';
    void termBody.offsetHeight;
    termBody.style.minHeight = termBody.scrollHeight + 'px';

    resetForTyping();
  }

  /* Intro splash integration */
  const splash = document.getElementById('splash');
  const splashCmd = document.getElementById('splashCmd');
  const splashTyped = document.getElementById('splashTyped');
  const splashLogo = document.getElementById('splashLogo');
  const splashTag = document.getElementById('splashTag');
  const page = document.getElementById('page');

  async function runIntro() {
    document.body.classList.add('locked');

    await sleep(300);
    await typeText(splashTyped, 'binaryfetch', 45, 70);
    await sleep(280);

    if (splashCmd) splashCmd.classList.add('hide');
    await sleep(150);
    if (splashLogo) splashLogo.classList.add('show');
    await sleep(350);
    if (splashTag) splashTag.classList.add('show');

    await sleep(900);

    if (splash) splash.classList.add('leaving');
    await sleep(90);
    if (page) page.classList.add('revealed');

    await sleep(950);
    if (splash) splash.style.display = 'none';
    document.body.classList.remove('locked');

    await sleep(250);
    runCycle();
  }

  window.addEventListener('load', () => {
    measureFullHeight();
    if (prefersReduced) {
      renderStatic();
      if (splash) splash.style.display = 'none';
      if (page) page.classList.add('revealed');
      document.body.classList.remove('locked');
    } else {
      runIntro();
    }
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (artInfo.style.display === 'none') measureFullHeight();
    });
  }
})();


/* ──────────────────────────────────────────────────────────
   7. 3D TILT CARD
────────────────────────────────────────────────────────── */
(function () {
  const wrap = document.getElementById('tiltWrap');
  const card = document.getElementById('tiltCard');
  if (!wrap || !card) return;

  const MAX_ROTATE = 6; // Reduced to 75% (was 8deg)
  let rafId = null;
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  function updateTilt() {
    currentRotX += (targetRotX - currentRotX) * 0.12;
    currentRotY += (targetRotY - currentRotY) * 0.12;

    card.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;

    if (Math.abs(targetRotX - currentRotX) > 0.01 || Math.abs(targetRotY - currentRotY) > 0.01) {
      rafId = requestAnimationFrame(updateTilt);
    } else {
      rafId = null;
    }
  }

  wrap.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    targetRotX = (0.5 - my) * MAX_ROTATE;
    targetRotY = -(0.5 - mx) * MAX_ROTATE;

    card.style.setProperty('--mx', `${(mx * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(my * 100).toFixed(1)}%`);

    if (!rafId) {
      rafId = requestAnimationFrame(updateTilt);
    }
  });

  wrap.addEventListener('mouseleave', () => {
    targetRotX = 0;
    targetRotY = 0;
    card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease';
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    setTimeout(() => { card.style.transition = ''; }, 600);
  });
})();


/* ──────────────────────────────────────────────────────────
   8. MODULES TABS
────────────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    document.querySelectorAll('.module-card').forEach(card => {
      const show = card.dataset.group === tab;
      card.classList.toggle('show', show);
    });
  });
});


/* ──────────────────────────────────────────────────────────
   9. FAQ ACCORDION
────────────────────────────────────────────────────────── */
document.querySelectorAll('.faq-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.faq-item');
    const body = item.querySelector('.faq-body');
    const open = item.classList.toggle('open');

    body.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', open);
  });
});


/* ──────────────────────────────────────────────────────────
   10. RIPPLE EFFECT ON BUTTONS
────────────────────────────────────────────────────────── */
document.querySelectorAll('.btn, .download-big, .nav-cta').forEach(btn => {
  btn.addEventListener('click', e => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple-el';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});



