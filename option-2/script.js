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

// Plaza view tabs (visit page)
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

// Timeline arrows
const timeline = document.querySelector('.timeline');
document.querySelectorAll('[data-scroll]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const step = timeline.querySelector('.year').offsetWidth + 16;
    timeline.scrollBy({ left: step * Number(btn.dataset.scroll), behavior: 'smooth' });
  });
});

// Link map pins and legend items on hover
const pins = document.querySelectorAll('.pin');
const items = document.querySelectorAll('.legend li');
const highlight = (i) => {
  pins.forEach((p, j) => p.classList.toggle('active', i === j));
  items.forEach((li, j) => li.classList.toggle('active', i === j));
};
[pins, items].forEach((list) => list.forEach((el, i) => {
  el.addEventListener('mouseenter', () => highlight(i));
  el.addEventListener('mouseleave', () => highlight(-1));
}));

// Gentle reveal on scroll
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.section > .wrap > *').forEach((el) => { el.classList.add('rv'); io.observe(el); });
}
