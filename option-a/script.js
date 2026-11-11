// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? 'Close' : 'Menu';
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
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
