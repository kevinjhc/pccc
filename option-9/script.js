// Philadelphia Peace Plaza — Option 9
// Content and rail links work without JS. This script only adds the active
// chapter state, progress, the view switcher, map highlighting, and signup.

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  /* ---------- Chapter rail ---------- */
  const chapters = Array.from(document.querySelectorAll('.chapter[id]'));
  const list = document.querySelector('.rail-list');
  const tiles = new Map();
  document.querySelectorAll('.rail-list .tile').forEach((tile) => {
    tiles.set(tile.getAttribute('href').slice(1), tile);
  });
  const statusName = document.querySelector('[data-status-name]');
  const statusNum = document.querySelector('[data-status-num]');
  const status = document.querySelector('.status');
  let active = -1;

  const pad = (n) => String(n).padStart(2, '0');

  function revealTile(tile) {
    if (!list || list.scrollWidth <= list.clientWidth + 1) return; // only the mobile strip scrolls
    const delta = tile.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollTo({
      left: list.scrollLeft + delta - 16,
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
    });
  }

  function setActive(index) {
    if (index === active || !chapters[index]) return;
    active = index;
    const id = chapters[index].id;
    tiles.forEach((tile, key) => {
      if (key === id) tile.setAttribute('aria-current', 'true');
      else tile.removeAttribute('aria-current');
    });
    const tile = tiles.get(id);
    if (tile) {
      if (statusName) statusName.textContent = tile.querySelector('.tile-t').textContent;
      if (statusNum) statusNum.textContent = pad(index + 1);
      if (status) status.style.setProperty('--status-c', getComputedStyle(tile).getPropertyValue('--c'));
      revealTile(tile);
    }
    updateProgress();
  }

  // The reading line sits 40% down the viewport.
  const line = () => window.innerHeight * 0.4;

  function indexAtLine() {
    let idx = 0;
    chapters.forEach((ch, i) => {
      if (ch.getBoundingClientRect().top <= line()) idx = i;
    });
    return idx;
  }

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty('--page-p', max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)).toFixed(4) : 0);
    const ch = chapters[active];
    if (!ch) return;
    const r = ch.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (line() - r.top) / r.height));
    const tile = tiles.get(ch.id);
    if (tile) tile.style.setProperty('--p', p.toFixed(4));
  }

  if (chapters.length && tiles.size) {
    if ('IntersectionObserver' in window) {
      // A thin band around the reading line: whichever chapter crosses it is active.
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(chapters.indexOf(entry.target));
        });
      }, { rootMargin: '-40% 0px -59% 0px', threshold: 0 });
      chapters.forEach((ch) => io.observe(ch));
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        // Keep the active state correct after fast jumps too.
        setActive(indexAtLine());
        updateProgress();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    setActive(indexAtLine());
  }

  /* ---------- View switcher (visit page) ---------- */
  document.querySelectorAll('[data-viewer]').forEach((group) => {
    const img = document.getElementById(group.dataset.viewer);
    if (!img) return;
    const buttons = group.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        const swap = () => {
          img.src = btn.dataset.src;
          img.alt = btn.dataset.alt;
          img.style.opacity = 1;
        };
        if (reduceMotion.matches) { swap(); return; }
        img.style.opacity = 0;
        setTimeout(swap, 200);
      });
    });
  });

  /* ---------- Map pins and legend (visit page) ---------- */
  const pins = document.querySelectorAll('.pin');
  const items = document.querySelectorAll('.legend li');
  const highlight = (i) => {
    pins.forEach((p, j) => p.classList.toggle('active', i === j));
    items.forEach((li, j) => li.classList.toggle('active', i === j));
  };
  [pins, items].forEach((group) => group.forEach((el, i) => {
    el.addEventListener('mouseenter', () => highlight(i));
    el.addEventListener('mouseleave', () => highlight(-1));
  }));

  /* ---------- Newsletter ---------- */
  document.querySelectorAll('[data-signup]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const done = document.createElement('p');
      done.className = 'signup-done';
      done.setAttribute('role', 'status');
      done.textContent = 'Thank you. We’ll be in touch.';
      form.replaceWith(done);
    });
  });
})();
