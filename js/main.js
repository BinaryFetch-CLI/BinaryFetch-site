'use strict';

/* ──────────────────────────────────────────────────────────
   1. PHYSICS MOMENTUM SCROLL
   Uses requestAnimationFrame with exponential velocity decay.
────────────────────────────────────────────────────────── */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window);
  if (prefersReduced || isTouch) return;

  let targetY  = window.scrollY;
  let currentY = window.scrollY;
  let rafId    = null;

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
const navLinks  = document.getElementById('navLinks');

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
  const ascii = document.getElementById('ascii');
  if (!ascii) return;

  const N = 16;
  const HALF = 8;
  let asciiHtml = '';
  for(let r=0;r<HALF;r++){
    asciiHtml += `<span class="row"><span class="a">${'#'.repeat(N)}</span> <span class="b">${'<'.repeat(N)}</span></span>`;
  }
  for(let r=0;r<HALF;r++){
    asciiHtml += `<span class="row"><span class="b">${'>'.repeat(N)}</span> <span class="a">${'#'.repeat(N)}</span></span>`;
  }
  ascii.innerHTML = asciiHtml;

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
    { type: 'SSD', drive: 'I:', used: 79.28,  total: 110.79, pct: 71, fs: 'NTFS', ext: 'Int' },
    { type: 'HDD', drive: 'Y:', used: 307.79, total: 465.75, pct: 66, fs: 'NTFS', ext: 'Int' },
  ];

  const perf = [
    { drive: 'C:', read: 1240.70, write: 770.78, sn: 'SN-1000', ext: 'Int' },
    { drive: 'D:', read: 75.41,   write: 66.31,  sn: 'SN-1001', ext: 'Int' },
    { drive: 'G:', read: 150.36,  write: 64.16,  sn: 'SN-1002', ext: 'Ext' },
    { drive: 'H:', read: 124.15,  write: 106.44, sn: 'SN-1003', ext: 'Int' },
    { drive: 'I:', read: 515.14,  write: 436.85, sn: 'SN-1004', ext: 'Int' },
    { drive: 'Y:', read: 110.26,  write: 84.49,  sn: 'SN-1005', ext: 'Int' },
  ];

  const pctClass = p => p >= 90 ? 'pct-high' : p >= 50 ? 'pct-mid' : 'pct-low';
  const typeClass = t => t === 'SSD' ? 'type-ssd' : t === 'HDD' ? 'type-hdd' : 'type-usb';
  const pctField = p => `(${p}%)`.padStart(5);

  function buildMemRows(){
    const rows = [];
    const totalPlain = `~ (Total: ${memData.total} GB) (Free: ${memData.free} GB) (Used: ${memData.used}%)`;
    const totalHtml  = `<span class="tilde">~</span>(Total: <b>${memData.total} GB</b>) (Free: <b>${memData.free} GB</b>) (Used: <span class="pct">${memData.used}%</span>)`;
    rows.push({ plain: totalPlain, html: totalHtml });
    memData.banks.forEach(b => {
      const plain = `~ ${b.label.padEnd(10)}(Used: ${String(b.used).padStart(2)}%) ${b.size} DDR4 2133 MHz`;
      const html  = `<span class="tilde">~</span>${b.label.padEnd(10)}(Used: <span class="pct">${String(b.used).padStart(2)}%</span>) <b>${b.size}</b> DDR4 2133 MHz`;
      rows.push({ plain, html });
    });
    return rows;
  }

  function buildStorageRows(){
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

  function buildPerfRows(){
    return perf.map(p => {
      const label = `Disk (${p.drive})`.padEnd(10);
      const readStr = p.read.toFixed(2).padStart(7);
      const writeStr = p.write.toFixed(2).padStart(7);
      const plain = `${label}[ Read: ${readStr} MB/s | Write: ${writeStr} MB/s | ${p.sn} ${p.ext} ]`;
      const html = `<span class="type-generic">${label}</span><span class="bracket">[</span> <span class="read">Read: ${readStr} MB/s</span> <span class="bracket">|</span> <span class="write">Write: ${writeStr} MB/s</span> <span class="bracket">|</span> <span class="sn">${p.sn} ${p.ext}</span> <span class="bracket">]</span>`;
      return { plain, html };
    });
  }

  function buildLeftHeader(label, targetWidth){
    const prefix = '~>> ';
    const head = `${prefix}${label} `;
    const dashCount = Math.max(3, targetWidth - head.length - 1);
    const dashes = '-'.repeat(dashCount);
    return {
      plain: `${head}${dashes}*`,
      html: `<span class="prefix">${prefix}</span><span class="hl">${label}</span> ${dashes}*`
    };
  }

  function buildCenteredHeader(label, targetWidth){
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

  function renderBlock(containerId, rows, startDelay, step){
    const container = document.getElementById(containerId);
    if (!container) return startDelay;
    container.innerHTML = rows.map((row, i) => {
      const delay = (startDelay + i * step).toFixed(3);
      const cls = row.isHead ? 'mono-row head-row' : 'mono-row';
      return `<div class="${cls}" style="animation-delay:${delay}s">${row.html}</div>`;
    }).join('');
    return startDelay + rows.length * step + 0.1;
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

  let t = 0.35;
  document.querySelectorAll('.info-row').forEach((row, i) => { row.style.animationDelay = (t + i * 0.05) + 's'; });
  t += document.querySelectorAll('.info-row').length * 0.05 + 0.2;

  t = renderBlock('memRows', memRowsFinal, t, 0.05) + 0.1;
  t = renderBlock('storageBody', storageRowsFinal, t, 0.05) + 0.1;
  t = renderBlock('perfBody', perfRowsFinal, t, 0.05);

  const cursorLine = document.getElementById('cursorLine');
  if (cursorLine) cursorLine.style.animationDelay = t + 's';

  function alignColumns(){
    const info = document.getElementById('infoRows');
    const term = document.getElementById('termBody');
    if (!info || !term) return;
    if (window.innerWidth <= 760) {
      ['memRows','storageBody','perfBody'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.paddingLeft = '0px';
      });
      return;
    }
    const icon = info.querySelector('.info-row svg') || info.querySelector('.info-row');
    if (!icon) return;
    const offset = Math.round(icon.getBoundingClientRect().left - term.getBoundingClientRect().left);
    ['memRows','storageBody','perfBody'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.paddingLeft = offset + 'px';
    });
  }

  const BASE_MONO_SIZE = 12;
  function fitMonoBlock(id){
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

  function fitAllMonoBlocks(){
    ['memRows','storageBody','perfBody'].forEach(fitMonoBlock);
  }

  function refreshLayout(){
    alignColumns();
    fitAllMonoBlocks();
  }

  refreshLayout();
  window.addEventListener('resize', refreshLayout);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshLayout);
  }
  window.addEventListener('load', refreshLayout);
})();


/* ──────────────────────────────────────────────────────────
   7. 3D TILT CARD
────────────────────────────────────────────────────────── */
(function () {
  const wrap = document.getElementById('tiltWrap');
  const card = document.getElementById('tiltCard');
  if (!wrap || !card) return;

  const MAX_ROTATE = 10;

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



