import { createOptimizedPicture } from '../../scripts/aem.js';

function animateValue(el, start, end, suffix, duration) {
  const startTime = performance.now();
  const isDecimal = String(end).includes('.');

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;
    const display = isDecimal ? current.toFixed(1) : Math.floor(current);
    el.textContent = display + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = (isDecimal ? end.toFixed(1) : end) + suffix;
    }
  }

  requestAnimationFrame(update);
}

function parseStatValue(raw) {
  // Extract numeric value, suffix (e.g. +, %, M, B, K)
  const match = raw.trim().match(/^([\d.]+)([^\d.]*)$/);
  if (match) {
    return { value: parseFloat(match[1]), suffix: match[2] };
  }
  return { value: 0, suffix: raw };
}

export default async function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  if (cells.length < 2) return;

  // First cell = heading
  const headingCell = cells[0];
  headingCell.classList.add('stats-bar-heading');

  // Remaining cells = stats
  const statsWrapper = document.createElement('div');
  statsWrapper.classList.add('stats-bar-stats');

  cells.slice(1).forEach((cell) => {
    const statEl = document.createElement('div');
    statEl.classList.add('stats-bar-stat');

    // The strong element holds the number/value
    const strong = cell.querySelector('strong');
    const valueEl = document.createElement('span');
    valueEl.classList.add('stats-bar-value');

    let rawValue = '';
    if (strong) {
      rawValue = strong.textContent.trim();
    } else {
      // Fallback: first text node or paragraph
      const p = cell.querySelector('p');
      if (p) rawValue = p.childNodes[0]?.textContent?.trim() || '';
    }

    const { value, suffix } = parseStatValue(rawValue);
    valueEl.textContent = '0' + suffix;
    valueEl.dataset.target = value;
    valueEl.dataset.suffix = suffix;

    // Label = remaining text (em or second paragraph or text after strong)
    const labelEl = document.createElement('span');
    labelEl.classList.add('stats-bar-label');

    const em = cell.querySelector('em');
    if (em) {
      labelEl.textContent = em.textContent.trim();
    } else {
      // Try second paragraph or paragraph text after the number
      const paras = cell.querySelectorAll('p');
      if (paras.length >= 2) {
        labelEl.textContent = paras[1].textContent.trim();
      } else if (paras.length === 1) {
        // Label might be inline after the strong
        const fullText = paras[0].textContent.trim();
        const labelText = fullText.replace(rawValue, '').trim();
        labelEl.textContent = labelText;
      }
    }

    statEl.append(valueEl, labelEl);
    statsWrapper.append(statEl);
  });

  // Rebuild block
  const container = document.createElement('div');
  container.classList.add('stats-bar-inner');
  container.append(headingCell, statsWrapper);
  block.replaceChildren(container);

  // Animate on intersection
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        block.querySelectorAll('.stats-bar-value').forEach((el) => {
          const target = parseFloat(el.dataset.target);
          const suffix = el.dataset.suffix;
          animateValue(el, 0, target, suffix, 1600);
        });
      }
    });
  }, { threshold: 0.3 });

  observer.observe(block);
}
