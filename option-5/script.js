// Philadelphia Peace Plaza — Option 5
document.documentElement.classList.remove('no-js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
  });
}

// View switcher (visit page)
document.querySelectorAll('[data-viewer]').forEach((group) => {
  const img = document.getElementById(group.dataset.viewer);
  const cap = document.getElementById(group.dataset.caption);
  const buttons = group.querySelectorAll('button');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-pressed') === 'true') return;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const swap = () => {
        img.src = btn.dataset.src;
        img.alt = btn.dataset.alt;
        if (cap) cap.innerHTML = '<b>' + btn.dataset.label + '</b>';
        img.style.opacity = 1;
      };
      if (reduceMotion) { swap(); return; }
      img.style.opacity = 0;
      setTimeout(swap, 280);
    });
  });
});

// Timeline arrows
const timeline = document.querySelector('.timeline');
if (timeline) {
  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = timeline.querySelector('.year').offsetWidth;
      timeline.scrollBy({ left: step * Number(btn.dataset.scroll), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
}

// Map: link pins and legend entries
const pins = document.querySelectorAll('.pin');
const items = document.querySelectorAll('.legend li');
if (pins.length && items.length) {
  const highlight = (i) => {
    pins.forEach((p, j) => p.classList.toggle('active', i === j));
    items.forEach((li, j) => li.classList.toggle('active', i === j));
  };
  [pins, items].forEach((list) => list.forEach((el, i) => {
    el.addEventListener('mouseenter', () => highlight(i));
    el.addEventListener('mouseleave', () => highlight(-1));
  }));
}

// Planting palette: mark the current season (Northern Hemisphere, meteorological)
const seasons = document.querySelectorAll('.season[data-season]');
if (seasons.length) {
  const m = new Date().getMonth(); // 0 = Jan
  const now = m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'fall' : 'winter';
  seasons.forEach((s) => s.classList.toggle('is-now', s.dataset.season === now));
}

// Newsletter (no backend yet)
const signup = document.getElementById('signup');
if (signup) {
  signup.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = document.createElement('p');
    p.className = 'signup-thanks';
    p.setAttribute('role', 'status');
    p.textContent = 'Thank you. We’ll be in touch.';
    signup.replaceWith(p);
  });
}

// Gentle reveal on scroll (content is visible without JS)
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.section > .wrap > *').forEach((el) => {
    el.classList.add('rv');
    io.observe(el);
  });
}
