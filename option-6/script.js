(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Live Philadelphia time */
  const clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric', minute: '2-digit', second: '2-digit',
    });
    const tzFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' });
    const iso = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
    const tick = () => {
      const now = new Date();
      const text = fmt.format(now);
      const tzPart = tzFmt.formatToParts(now).find((p) => p.type === 'timeZoneName');
      const tz = tzPart ? tzPart.value : '';
      clocks.forEach((c) => {
        c.textContent = text;
        let tzEl = c.nextElementSibling;
        if (!tzEl || !tzEl.classList.contains('clock-tz')) {
          tzEl = document.createElement('span');
          tzEl.className = 'clock-tz';
          c.after(tzEl);
        }
        tzEl.textContent = ' ' + tz;
        c.setAttribute('datetime', iso.format(now).replace(' ', 'T'));
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* Mobile menu */
  const toggle = document.querySelector('.menu-toggle');
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

  /* Underline the nav item for the section in view (home page) */
  const navLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
  if (navLinks.length && 'IntersectionObserver' in window) {
    const map = new Map();
    navLinks.forEach((a) => {
      const sec = document.querySelector(a.getAttribute('href'));
      if (sec) map.set(sec, a);
    });
    const visible = new Set();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      let current = null;
      map.forEach((a, sec) => { if (visible.has(sec)) current = a; });
      navLinks.forEach((a) => a.classList.toggle('is-current', a === current));
      nav.classList.toggle('has-section', !!current);
    }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, sec) => spy.observe(sec));
  }

  /* Index: filter, sort, preview */
  const list = document.querySelector('[data-rows]');
  if (list) {
    const items = [...list.children];
    const preview = document.querySelector('[data-preview]');
    const pImg = preview && preview.querySelector('[data-p-img]');
    const pNone = preview && preview.querySelector('[data-p-none]');
    const pNo = preview && preview.querySelector('[data-p-no]');
    const pDate = preview && preview.querySelector('[data-p-date]');
    const pCap = preview && preview.querySelector('[data-p-cap]');
    const pName = preview && preview.querySelector('[data-p-name]');
    const empty = document.querySelector('[data-empty]');
    const count = document.querySelector('[data-count]');
    let active = null;
    let swapTimer;

    const show = (li) => {
      if (!li || li === active) return;
      items.forEach((x) => x.classList.toggle('is-active', x === li));
      active = li;
      if (!preview) return;
      const date = li.querySelector('.c-date').textContent.trim();
      pNo.textContent = li.querySelector('.c-no').textContent;
      pDate.textContent = date === '—' ? li.querySelector('.c-dim').textContent : date;
      pCap.textContent = li.dataset.cap || '';
      pName.textContent = li.querySelector('.c-name').textContent;
      const src = li.dataset.img;
      clearTimeout(swapTimer);
      if (!src) {
        pImg.hidden = true;
        pNone.hidden = false;
        return;
      }
      pNone.hidden = true;
      pImg.hidden = false;
      if (pImg.getAttribute('src') === src) return;
      const swap = () => { pImg.src = src; pImg.classList.remove('is-swapping'); };
      if (reduceMotion) { swap(); return; }
      pImg.classList.add('is-swapping');
      swapTimer = setTimeout(swap, 140);
    };

    items.forEach((li) => {
      li.addEventListener('mouseenter', () => show(li));
      li.addEventListener('focusin', () => show(li));
    });
    show(items[0]);

    // Preload preview images once the index is near
    const preload = () => {
      [...new Set(items.map((li) => li.dataset.img).filter(Boolean))].forEach((src) => { const i = new Image(); i.src = src; });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        if (entries.some((e) => e.isIntersecting)) { preload(); obs.disconnect(); }
      }, { rootMargin: '400px' });
      io.observe(list);
    }

    // Filter
    const filterBtns = document.querySelectorAll('[data-filter]');
    filterBtns.forEach((btn) => btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let n = 0;
      items.forEach((li) => {
        const on = f === 'all' || li.dataset.cat === f;
        li.hidden = !on;
        if (on) n += 1;
      });
      if (count) count.textContent = n;
      if (empty) empty.hidden = n > 0;
      const first = items.find((li) => !li.hidden);
      if (first && (!active || active.hidden)) { active = null; show(first); }
    }));

    // Sort
    const sortBtns = document.querySelectorAll('[data-sort]');
    const sorters = {
      no: (a, b) => a.dataset.no - b.dataset.no,
      year: (a, b) => {
        const ya = Number(a.dataset.year) || 9999;
        const yb = Number(b.dataset.year) || 9999;
        return ya - yb || a.dataset.no - b.dataset.no;
      },
      name: (a, b) => a.querySelector('.c-name').textContent.localeCompare(b.querySelector('.c-name').textContent),
    };
    sortBtns.forEach((btn) => btn.addEventListener('click', () => {
      sortBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      items.slice().sort(sorters[btn.dataset.sort]).forEach((li) => list.appendChild(li));
    }));
  }

  /* Visit: view switcher */
  document.querySelectorAll('[data-viewer]').forEach((group) => {
    const fig = document.getElementById(group.dataset.viewer);
    const img = fig.querySelector('[data-v-img]');
    const label = fig.querySelector('[data-v-label]');
    group.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        const swap = () => {
          img.src = btn.dataset.src;
          img.alt = btn.dataset.alt;
          label.textContent = `${btn.dataset.code} · ${btn.dataset.label}`;
          img.classList.remove('is-swapping');
        };
        if (reduceMotion) { swap(); return; }
        img.classList.add('is-swapping');
        setTimeout(swap, 200);
      });
    });
  });

  /* Visit: link map pins and legend */
  const pins = document.querySelectorAll('.pin');
  const legend = document.querySelectorAll('.legend li');
  if (pins.length && legend.length) {
    const highlight = (i) => {
      pins.forEach((p, j) => p.classList.toggle('active', i === j));
      legend.forEach((li, j) => li.classList.toggle('active', i === j));
    };
    pins.forEach((p, i) => {
      p.addEventListener('mouseenter', () => highlight(i));
      p.addEventListener('mouseleave', () => highlight(-1));
    });
    legend.forEach((li, i) => {
      li.addEventListener('mouseenter', () => highlight(i));
      li.addEventListener('mouseleave', () => highlight(-1));
      li.addEventListener('focus', () => highlight(i));
      li.addEventListener('blur', () => highlight(-1));
    });
  }

  /* Newsletter */
  document.querySelectorAll('[data-signup]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const done = form.querySelector('.signup-done');
      form.querySelector('.signup-row').hidden = true;
      if (done) done.textContent = 'Thank you. We’ll be in touch.';
    });
  });
})();
