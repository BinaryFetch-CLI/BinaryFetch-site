'use strict';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   1. PHYSICS MOMENTUM SCROLL
   Uses requestAnimationFrame with exponential velocity decay.
   Start scrolling â†’ smooth acceleration to match user speed.
   Stop scrolling â†’ gradual coast to rest.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
// Only override on non-touch, non-reduced-motion devices
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = ('ontouchstart' in window);
if (prefersReduced || isTouch) return;

let targetY  = window.scrollY;
let currentY = window.scrollY;
let velocity = 0;
let rafId    = null;
let isScrolling = false;
let scrollEndTimer = null;

const FRICTION  = 0.085; // lower = more slide (0.06â€“0.12 range)
const ACCEL     = 0.18;  // how fast currentY catches targetY

function tick() {
// Spring toward target
const delta = targetY - currentY;
currentY += delta * ACCEL;

window.scrollTo(0, currentY);

// Keep running if still moving meaningfully
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

// Sync on other scroll sources (keyboard, scrollbar drag)
window.addEventListener('scroll', () => {
if (!rafId) {
targetY = window.scrollY;
currentY = window.scrollY;
}
}, { passive: true });
})();


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   2. NAVBAR SCROLL EFFECT
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   3. HAMBURGER MENU
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

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


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   4. SMOOTH ANCHOR SCROLL (for hash links inside the page)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
a.addEventListener('click', e => {
const target = document.querySelector(a.getAttribute('href'));
if (!target) return;
e.preventDefault();
const top = target.getBoundingClientRect().top + window.scrollY - 68;
// Push target into physics scroll
window.dispatchEvent(new WheelEvent('wheel', {
deltaY: top - window.scrollY,
deltaMode: 0,
bubbles: true,
cancelable: true
}));
// Fallback for reduced-motion / touch
target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
});


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   5. INTERSECTION OBSERVER â€” REVEAL + COUNTERS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const countersDone = new Set();

function animateCounter(el, target, suffix = '') {
if (countersDone.has(el)) return;
countersDone.add(el);
const start = performance.now();
const duration = 1200 + Math.random() * 400;

function step(now) {
const t = Math.min((now - start) / duration, 1);
// ease-out cubic
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

// Fire counters on stats bar
if (entry.target.closest('.stats-grid')) {
document.querySelectorAll('[data-target]').forEach(el => {
animateCounter(el, parseInt(el.dataset.target), el.id?.startsWith('stat2') ? '+' : '');
});
}
// Fire counters on arch grid
if (entry.target.closest('.arch-grid') || entry.target.classList.contains('arch-card')) {
document.querySelectorAll('.arch-num[data-target]').forEach(el => {
animateCounter(el, parseInt(el.dataset.target));
});
}
});
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   6. HERO TERMINAL TYPING ANIMATION
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
const typing   = document.getElementById('typingText');
const output   = document.getElementById('termOutput');
const cursor   = document.getElementById('cursor');

const sequence = [
{ type: 'cmd', text: 'BinaryFetch.exe', delay: 80 },
{ type: 'pause', ms: 500 },
{ type: 'output', lines: [
{ cls: 't-out', text: '' },
{ cls: 't-acc', text: '  ðŸ BinaryFetch v1.3 â€” System Information' },
{ cls: 't-out', text: '  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€' },
{ cls: 't-out', text: '  OS      Windows 11 Pro  Â·  x64' },
{ cls: 't-out', text: '  CPU     AMD Ryzen 7  Â·  8C/16T  Â·  4.2 GHz' },
{ cls: 't-out', text: '  GPU     NVIDIA RTX 3070  Â·  8 GB VRAM' },
{ cls: 't-out', text: '  RAM     16 GB  Â·  67% used' },
{ cls: 't-out', text: '  NET     Home-WiFi  Â·  192.168.1.42' },
{ cls: 't-out', text: '  AUDIO   Headphones  Â·  Microphone' },
{ cls: 't-acc', text: '  âœ“ Self-healing enabled  Â·  Config OK' },
]},
];

let running = false;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function typeText(text, delayMs) {
for (const ch of text) {
typing.textContent += ch;
await sleep(delayMs + Math.random() * 30);
}
}

async function showOutput(lines) {
for (const line of lines) {
await sleep(90);
const div = document.createElement('div');
div.className = line.cls;
div.textContent = line.text;
output.appendChild(div);
}
}

async function run() {
if (running) return;
running = true;
await sleep(900);

for (const step of sequence) {
if (step.type === 'cmd') {
await typeText(step.text, step.delay);
} else if (step.type === 'pause') {
await sleep(step.ms);
} else if (step.type === 'output') {
cursor.style.display = 'none';
await showOutput(step.lines);
}
}
}

// Start as soon as the page loads
if (document.readyState === 'complete') run();
else window.addEventListener('load', run);
})();


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   7. 3D TILT CARD
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
const wrap = document.getElementById('tiltWrap');
const card = document.getElementById('tiltCard');
if (!wrap || !card) return;

const MAX_ROTATE = 10; // degrees

wrap.addEventListener('mousemove', (e) => {
const rect = card.getBoundingClientRect();
const mx = (e.clientX - rect.left) / rect.width;
const my = (e.clientY - rect.top)  / rect.height;

const rotX =  (0.5 - my) * MAX_ROTATE;
const rotY = -(0.5 - mx) * MAX_ROTATE;

card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
card.style.transition = 'none';
card.style.setProperty('--mx', `${mx * 100}%`);
card.style.setProperty('--my', `${my * 100}%`);
});

wrap.addEventListener('mouseleave', () => {
card.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s';
card.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
setTimeout(() => { card.style.transition = ''; }, 700);
});
})();


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   8. MODULES TABS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   9. FAQ ACCORDION
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.querySelectorAll('.faq-trigger').forEach(trigger => {
trigger.addEventListener('click', () => {
const item = trigger.closest('.faq-item');
const body = item.querySelector('.faq-body');
const open = item.classList.toggle('open');

body.classList.toggle('open', open);
trigger.setAttribute('aria-expanded', open);
});
});


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   10. RIPPLE EFFECT ON BUTTONS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.querySelectorAll('.btn, .download-big').forEach(btn => {
btn.addEventListener('click', e => {
const rect   = btn.getBoundingClientRect();
const size   = Math.max(rect.width, rect.height);
const ripple = document.createElement('span');
ripple.className = 'ripple-el';
ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
btn.appendChild(ripple);
ripple.addEventListener('animationend', () => ripple.remove());
});
});


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   11. HERO PARALLAX (subtle)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) return;

const heroInner = document.querySelector('.hero-inner');
window.addEventListener('scroll', () => {
const y = window.scrollY;
if (y < window.innerHeight && heroInner) {
heroInner.style.transform = `translateY(${y * 0.2}px)`;
heroInner.style.opacity   = `${1 - y / (window.innerHeight * 0.8)}`;
}
}, { passive: true });
})();

