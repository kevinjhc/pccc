(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  const toggle = document.querySelector('.bar-toggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
    });
  }

  // Plaza view switcher (visit page)
  document.querySelectorAll('[data-viewer]').forEach((group) => {
    const img = document.getElementById(group.dataset.viewer);
    if (!img) return;
    group.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        const swap = () => { img.src = btn.dataset.src; img.alt = btn.dataset.alt; };
        if (reduceMotion) { swap(); return; }
        img.style.opacity = '0';
        setTimeout(() => {
          swap();
          if (img.complete) img.style.opacity = '1';
          else img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
        }, 220);
      });
    });
  });

  // Link map pins and legend items (hover + keyboard focus)
  const pins = document.querySelectorAll('.pin');
  const items = document.querySelectorAll('.legend li');
  if (pins.length && items.length) {
    const highlight = (i) => {
      pins.forEach((p, j) => p.classList.toggle('active', i === j));
      items.forEach((li, j) => li.classList.toggle('active', i === j));
    };
    items.forEach((li, i) => {
      li.addEventListener('mouseenter', () => highlight(i));
      li.addEventListener('mouseleave', () => highlight(-1));
      li.addEventListener('focus', () => highlight(i));
      li.addEventListener('blur', () => highlight(-1));
    });
    pins.forEach((p, i) => {
      p.addEventListener('mouseenter', () => highlight(i));
      p.addEventListener('mouseleave', () => highlight(-1));
    });
  }

  // Newsletter (no backend: confirm in place)
  document.querySelectorAll('[data-signup]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.createElement('p');
      msg.className = 'signup-done';
      msg.setAttribute('role', 'status');
      msg.textContent = 'Thank you. We’ll be in touch.';
      form.replaceWith(msg);
    });
  });

  // Gentle reveal on scroll (JS + motion allowed only; content is visible otherwise)
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll(
      '.display, .quiet > *, .split-words, .stat, .timeline li, .program, .calls li, .modes > div, .index li, .features > div, .design-pair figure, .statue-media'
    );
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // already on screen: leave as is
      el.classList.add('rv');
      io.observe(el);
    });
  }
})();
