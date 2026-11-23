document.documentElement.classList.add('js');

// Buttons: duplicate the label so it can roll up on hover, like the nav
document.querySelectorAll('.btn').forEach((b) => {
  if (b.querySelector('.btn-roll')) return;
  const inner = b.innerHTML.trim();
  b.innerHTML = `<span class="btn-roll"><span class="a">${inner}</span><span class="b" aria-hidden="true">${inner}</span></span>`;
});
// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    document.documentElement.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? 'Close' : 'Menu';
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    document.documentElement.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', false);
    toggle.textContent = 'Menu';
  }));
}

// Timeline arrows
const timeline = document.querySelector('.timeline');
document.querySelectorAll('[data-scroll]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const year = timeline.querySelector('.year');
    const gap = parseFloat(getComputedStyle(timeline).columnGap) || 16;
    timeline.scrollBy({ left: (year.offsetWidth + gap) * Number(btn.dataset.scroll), behavior: 'smooth' });
  });
});

// Drag the timeline with the mouse (touch already scrolls natively)
if (timeline) {
  let down = false, startX = 0, startLeft = 0, moved = false;
  timeline.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startLeft = timeline.scrollLeft;
    timeline.classList.add('dragging');
    timeline.setPointerCapture(e.pointerId);
  });
  timeline.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    timeline.scrollLeft = startLeft - dx;
  });
  const end = (e) => {
    if (!down) return;
    down = false;
    timeline.classList.remove('dragging');
    if (timeline.hasPointerCapture(e.pointerId)) timeline.releasePointerCapture(e.pointerId);
  };
  timeline.addEventListener('pointerup', end);
  timeline.addEventListener('pointercancel', end);
  timeline.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
}

// Statement text fills in word by word as it scrolls through the viewport
document.querySelectorAll('.fill').forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const words = el.querySelectorAll('.w');
  const update = () => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const lit = Math.round(progress * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < lit));
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
});

// Follow-the-journey popup: opens from any [data-open-signup], and once per visit on its own
const modal = document.getElementById('signup');
if (modal) {
  let lastFocus = null;
  const open = () => {
    if (!modal.hidden) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add('modal-open');
    const first = modal.querySelector('input');
    if (first) first.focus();
  };
  const close = () => {
    modal.hidden = true;
    document.documentElement.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  };
  document.querySelectorAll('[data-open-signup]').forEach((b) => b.addEventListener('click', open));
  modal.querySelectorAll('[data-close-signup]').forEach((b) => b.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });

  const form = document.getElementById('signup-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.outerHTML = '<p class="md">Thank you for following the journey. We\u2019ll be in touch.</p>';
  });

  // Auto-show once per session: after 20 seconds or past the History section
  let seen = false;
  try { seen = sessionStorage.getItem('pppc-signup') === '1'; } catch (e) {}
  const auto = () => {
    if (seen) return;
    seen = true;
    try { sessionStorage.setItem('pppc-signup', '1'); } catch (e) {}
    open();
  };
  if (!seen) {
    const timer = setTimeout(auto, 20000);
    const trigger = document.getElementById('visit');
    if (trigger && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { clearTimeout(timer); io.disconnect(); auto(); }
      });
      io.observe(trigger);
    }
  }
}

// History timeline: light up a year on hover, focus, or tap
document.querySelectorAll('.years').forEach((list) => {
  const items = list.querySelectorAll('li');
  const on = (li) => items.forEach((x) => x.classList.toggle('is-on', x === li));
  items.forEach((li) => {
    const b = li.querySelector('button');
    ['mouseenter', 'focus', 'click'].forEach((ev) => (ev === 'mouseenter' ? li : b).addEventListener(ev, () => on(li)));
  });
});

// Inline footer signup
document.querySelectorAll('[data-inline-signup]').forEach((f) => f.addEventListener('submit', (e) => {
  e.preventDefault();
  f.outerHTML = '<p class="inline-thanks">Thank you. We\u2019ll be in touch.</p>';
}));

// Statue symbols: the block in the middle of the screen lights its spot on the pinned photo
const symbols = document.querySelectorAll('.symbols li');
if (symbols.length) {
  const spots = document.querySelectorAll('.spot');
  const label = document.querySelector('.spot-label');
  const setOn = (li) => {
    symbols.forEach((x) => x.classList.toggle('is-on', x === li));
    spots.forEach((sp) => sp.classList.toggle('is-on', sp.dataset.spot === li.dataset.spot));
    if (label) label.textContent = li.querySelector('h3').textContent;
  };
  setOn(symbols[0]);
  symbols.forEach((li) => li.addEventListener('mouseenter', () => setOn(li)));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setOn(en.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    symbols.forEach((li) => io.observe(li));
  }
}

// Gentle fade-in as content scrolls into view
(() => {
  const targets = document.querySelectorAll('main > section:not(.poster) .head, main > section:not(.poster) .cols, .banner, .years, .history-text, .visit-split, .phases, .support, .portraits, .logo-strip, .footer-top, .social');
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach((t) => { t.classList.add('rv'); io.observe(t); });
})();
