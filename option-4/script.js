// Philadelphia Peace Plaza — Option 4
// Everything here is progressive enhancement: the pages are fully readable without it.

(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Mobile menu ----------
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // ---------- View switcher (visit page) ----------
  document.querySelectorAll('[data-viewer]').forEach(function (group) {
    var img = document.getElementById(group.dataset.viewer);
    if (!img) return;
    var buttons = group.querySelectorAll('button');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var swap = function () {
          img.src = btn.dataset.src;
          img.alt = btn.dataset.alt;
          img.style.opacity = '';
        };
        if (reduceMotion) { swap(); return; }
        img.style.opacity = '0';
        setTimeout(swap, 300);
      });
    });
  });

  // ---------- Map pins <-> legend ----------
  var pins = document.querySelectorAll('.pin');
  var items = document.querySelectorAll('.legend li');
  if (pins.length && items.length) {
    var highlight = function (i) {
      pins.forEach(function (p, j) { p.classList.toggle('active', i === j); });
      items.forEach(function (li, j) { li.classList.toggle('active', i === j); });
    };
    [pins, items].forEach(function (list) {
      list.forEach(function (el, i) {
        el.addEventListener('mouseenter', function () { highlight(i); });
        el.addEventListener('mouseleave', function () { highlight(-1); });
      });
    });
  }

  // ---------- Newsletter ----------
  document.querySelectorAll('[data-signup]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.createElement('p');
      msg.className = 'signup-thanks';
      msg.setAttribute('role', 'status');
      msg.textContent = 'Thank you. We’ll be in touch.';
      form.replaceWith(msg);
    });
  });

  // ---------- Scroll effects ----------
  // Only hide-then-reveal when motion is welcome and the observer exists.
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('motion');

  var once = function (selector, className, options) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          io.unobserve(entry.target);
        }
      });
    }, options);
    els.forEach(function (el) { io.observe(el); });
  };

  // General fade-up and photo "develop" (grayscale warming to color)
  once('.reveal', 'in', { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  once('.develop', 'in', { threshold: 0.3 });

  // Inscription: each line lights as it reaches the reading zone
  once('.inscription-text .line', 'lit', { threshold: 1, rootMargin: '0px 0px -30% 0px' });

  // Timeline: years brighten as they scroll into view
  once('.year', 'in', { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
})();
