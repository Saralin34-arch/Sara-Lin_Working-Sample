(function initProjectFilters() {
  const chips = $$('.chip');
  const cards = $$('.card');
  if (!chips.length || !cards.length) return;

  const applyFilter = (tag) => {
    cards.forEach((card) => {
      if (!card.dataset.tags) {
        card.style.display = '';
        return;
      }
      const tags = card.dataset.tags.split(' ');
      const show = tag === 'all' || tags.includes(tag);
      card.style.display = show ? '' : 'none';
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      applyFilter(chip.dataset.filter);
    });
  });

  (function hashFilter() {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const filter = params.get('filter');
    if (!filter) return;
    const target = chips.find((chip) => chip.dataset.filter === filter);
    if (target) target.click();
  })();
})();

(function designLabMotion() {
  const field = document.querySelector('[data-design-lab]');
  if (!field) return;
  const shapes = Array.from(field.querySelectorAll('.lab-shape'));
  if (!shapes.length) return;

  const applyMotion = (mx, my) => {
    shapes.forEach((shape, index) => {
      const depth = Number(shape.dataset.depth || 1);
      const tx = mx * depth * 28;
      const ty = my * depth * 22;
      const rotate = mx * depth * 10 + index * 6;
      shape.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotate}deg)`;
      shape.style.opacity = String(0.55 + Math.min(Math.abs(mx) + Math.abs(my), 1) * 0.25);
    });
  };

  let rafId;
  const schedule = (mx, my) => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => applyMotion(mx, my));
  };

  field.addEventListener('pointermove', (event) => {
    const rect = field.getBoundingClientRect();
    const mx = (event.clientX - rect.left) / rect.width - 0.5;
    const my = (event.clientY - rect.top) / rect.height - 0.5;
    schedule(mx * 2, my * 2);
  });

  field.addEventListener('pointerleave', () => {
    schedule(0, 0);
  });

  schedule(0, 0);
})();
