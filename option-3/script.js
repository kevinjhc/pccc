// Philadelphia Peace Plaza — Option 3
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
    }
  }));
}

// View switcher (visit page): buttons swap the image, alt text, and caption
document.querySelectorAll('[data-viewer]').forEach((group) => {
  const img = document.getElementById(group.dataset.viewer);
  const caption = document.getElementById(group.dataset.caption);
  const buttons = group.querySelectorAll('button');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-pressed') === 'true') return;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const swap = () => {
        img.src = btn.dataset.src;
        img.alt = btn.dataset.alt;
        if (caption) caption.textContent = btn.dataset.alt;
        img.style.opacity = 1;
      };
      if (reduceMotion) { swap(); return; }
      img.style.opacity = 0;
      setTimeout(swap, 250);
    });
  });
});

// Link map pins and legend entries on hover / focus
const pins = document.querySelectorAll('.pin');
const items = document.querySelectorAll('.legend li');
const highlight = (i) => {
  pins.forEach((p, j) => p.classList.toggle('active', i === j));
  items.forEach((li, j) => li.classList.toggle('active', i === j));
};
pins.forEach((p, i) => {
  p.addEventListener('mouseenter', () => highlight(i));
  p.addEventListener('mouseleave', () => highlight(-1));
});
items.forEach((li, i) => {
  li.addEventListener('mouseenter', () => highlight(i));
  li.addEventListener('mouseleave', () => highlight(-1));
  li.addEventListener('focus', () => highlight(i));
  li.addEventListener('blur', () => highlight(-1));
});

// Newsletter (static placeholder)
document.querySelectorAll('[data-signup]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = document.createElement('p');
    p.className = 'signup-thanks';
    p.setAttribute('role', 'status');
    p.textContent = 'Thank you. We’ll be in touch.';
    form.replaceWith(p);
  });
});

// Gentle reveal on scroll
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.section > .wrap > *, .pull > *, .closing-grid > *').forEach((el) => {
    el.classList.add('rv');
    io.observe(el);
  });
}
