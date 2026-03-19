export default async function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];

  // First cell = headline
  const headlineCell = cells[0];
  const headlineEl = document.createElement('div');
  headlineEl.classList.add('stats-banner-headline');
  // Move all children from the headline cell
  [...headlineCell.children].forEach((child) => headlineEl.append(child));

  // Remaining cells = stats
  const statsWrapper = document.createElement('div');
  statsWrapper.classList.add('stats-banner-stats');

  cells.slice(1).forEach((cell) => {
    const statEl = document.createElement('div');
    statEl.classList.add('stats-banner-stat');

    // The bold element contains the number string
    const strong = cell.querySelector('strong');
    const label = cell.querySelector('p:not(:has(strong))');

    // Parse the raw number string e.g. "132+", "99.9%", "150M"
    const rawText = strong ? strong.textContent.trim() : '';

    // Split into numeric part and suffix
    const match = rawText.match(/^([\d.]+)([^\d.]*)$/);
    const numericValue = match ? parseFloat(match[1]) : null;
    const suffix = match ? match[2] : rawText;

    const numEl = document.createElement('span');
    numEl.classList.add('stats-banner-number');
    numEl.setAttribute('data-target', numericValue);
    numEl.setAttribute('data-suffix', suffix);
    numEl.textContent = rawText; // default before animation

    const labelEl = document.createElement('p');
    labelEl.classList.add('stats-banner-label');
    if (label) {
      labelEl.textContent = label.textContent.trim();
    } else {
      // Try to get label from a plain p without strong
      const allPs = [...cell.querySelectorAll('p')];
      const labelP = allPs.find((p) => !p.querySelector('strong'));
      if (labelP) labelEl.textContent = labelP.textContent.trim();
    }

    statEl.append(numEl);
    statEl.append(labelEl);
    statsWrapper.append(statEl);
  });

  // Clear block and rebuild
  block.replaceChildren();
  block.append(headlineEl);
  block.append(statsWrapper);

  // Count-up animation
  function animateCountUp(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    if (Number.isNaN(target)) {
      return;
    }
    const duration = 1800;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - (1 - progress) ** 3;
      const current = eased * target;
      el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  // Trigger animation on scroll into view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          block.querySelectorAll('.stats-banner-number').forEach((numEl) => {
            animateCountUp(numEl);
          });
        }
      });
    },
    { threshold: 0.3 },
  );

  observer.observe(block);
}
