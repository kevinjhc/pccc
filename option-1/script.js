// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? 'Close' : 'Menu';
  });
}

// Plaza view switcher (visit page)
document.querySelectorAll('[data-viewer]').forEach((group) => {
  const img = document.getElementById(group.dataset.viewer);
  group.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === btn));
      img.style.opacity = 0;
      setTimeout(() => {
        img.src = btn.dataset.src;
        img.alt = btn.dataset.alt;
        img.style.opacity = 1;
      }, 200);
    });
  });
});

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
