(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    var label = toggle.querySelector('.menu-toggle__label');
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'close' : 'menu';
    };
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
    });
  }

  // Header gains a frosted backing once the page scrolls
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Sky: crossfade the fixed color field to match the section in the middle of the viewport
  var layers = {};
  document.querySelectorAll('.sky__layer').forEach(function (l) { layers[l.dataset.layer] = l; });
  var current = 'dawn';
  var setMood = function (mood) {
    if (!layers[mood] || mood === current) return;
    layers[current].classList.remove('is-active');
    layers[mood].classList.add('is-active');
    current = mood;
  };
  if ('IntersectionObserver' in window) {
    var moodObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setMood(e.target.dataset.mood); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('[data-mood]').forEach(function (s) { moodObserver.observe(s); });
  }

  // View switcher (visit page)
  document.querySelectorAll('[data-viewer]').forEach(function (group) {
    var img = document.getElementById(group.dataset.viewer);
    if (!img) return;
    var figure = img.closest('.viewer');
    var glow = document.getElementById('viewer-glow');
    var labelEl = document.getElementById('viewer-label');
    group.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var swap = function () {
          img.src = btn.dataset.src;
          img.alt = btn.dataset.alt;
          if (glow) glow.src = btn.dataset.src;
          if (labelEl) labelEl.textContent = 'looking ' + btn.textContent.trim().toLowerCase();
        };
        if (reduceMotion || !figure) { swap(); return; }
        figure.classList.add('is-fading');
        setTimeout(function () {
          swap();
          var done = function () { figure.classList.remove('is-fading'); };
          if (img.complete) requestAnimationFrame(done); else img.addEventListener('load', done, { once: true });
        }, 450);
      });
    });
    // Warm the cache so switching feels instant
    group.querySelectorAll('button').forEach(function (b) { var i = new Image(); i.src = b.dataset.src; });
  });

  // Map: link pins and legend items
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
    items.forEach(function (li, i) {
      li.tabIndex = 0;
      li.addEventListener('focus', function () { highlight(i); });
      li.addEventListener('blur', function () { highlight(-1); });
    });
  }

  // Gentle reveal (skipped entirely for reduced motion)
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.section > .wrap > *, .focus__frame, .dissolve__inner').forEach(function (el) {
      el.classList.add('rv');
      io.observe(el);
    });
  }
})();
