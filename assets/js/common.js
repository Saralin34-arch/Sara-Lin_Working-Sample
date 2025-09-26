const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const year = $('#year');
if (year) {
  year.textContent = new Date().getFullYear();
}

(function initTheme() {
  const themeToggle = $('#themeToggle');
  if (!themeToggle) return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const getPreferredTheme = () =>
    localStorage.getItem('theme') ||
    document.documentElement.getAttribute('data-theme') ||
    (prefersDark.matches ? 'dark' : 'light');

  const applyState = (next, persist = true) => {
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
    if (persist) {
      localStorage.setItem('theme', next);
    }
  };

  applyState(getPreferredTheme(), false);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyState(next, true);
  });

  prefersDark.addEventListener('change', (event) => {
    if (localStorage.getItem('theme')) return; // respect user choice if already set
    applyState(event.matches ? 'dark' : 'light', false);
  });
})();

(function headerEnhancements() {
  const header = $('.site-header');
  if (!header || !document.body) return;

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      header.classList.toggle('shrink', y > 20);
    },
    { passive: true }
  );
})();

(function defineSmoothAnchors() {
  if (typeof window === 'undefined') return;

  window.setupSmoothAnchors = (context = document) => {
    const localLinks = Array.from(context.querySelectorAll('a[href^="#"]'));
    if (!localLinks.length) return;

    localLinks.forEach((link) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      if (link.dataset.smoothScrollBound === 'true') return;

      link.addEventListener('click', (event) => {
        const target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', hash);
      });

      link.dataset.smoothScrollBound = 'true';
    });
  };

  window.setupSmoothAnchors();
})();

(function highlightActiveNav() {
  const links = $$('.site-nav a[href]');
  if (!links.length) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    const linkPath = href.split('#')[0] || 'index.html';
    if (linkPath === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const localAnchors = links.filter((link) => link.getAttribute('href')?.startsWith('#'));
  if (localAnchors.length) {
    const idMap = new Map(
      localAnchors.map((anchor) => [anchor.getAttribute('href') || '', anchor])
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const anchor = idMap.get(`#${entry.target.id}`);
          if (!anchor) return;
          anchor.toggleAttribute('data-inview', entry.isIntersecting);
        });
        const active = localAnchors.find((anchor) => anchor.hasAttribute('data-inview'));
        localAnchors.forEach((anchor) => anchor.removeAttribute('aria-current'));
        if (active) active.setAttribute('aria-current', 'true');
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0.25, 0.51] }
    );

    localAnchors.forEach((anchor) => {
      const target = document.querySelector(anchor.getAttribute('href') || '');
      if (target) observer.observe(target);
    });
  }
})();
