import { createOptimizedPicture } from '../../scripts/aem.js';

function parseValue(raw) {
  // Extract numeric part and suffix (e.g. '132+' => { number: 132, suffix: '+' })
  const match = raw.trim().match(/^([\d,.]+)([^\d,.]*)$/);
  if (!match) return { number: null, suffix: raw };
  const number = parseFloat(match[1].replace(/,/g, ''));
  const suffix = match[2] || '';
  return { number, suffix };
}

function animateCounter(el, target, suffix, duration = 1800) {
  const start = performance.now();
  const isFloat = !Number.isInteger(target);

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(progress);
    const current = target * eased;

    let display;
    if (isFloat) {
      display = current.toFixed(1);
    } else if (target >= 1000) {
      display = Math.round(current).toLocaleString();
    } else {
      display = Math.round(current).toString();
    }

    el.textContent = display + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      // Ensure final value is exact
      if (isFloat) {
        el.textContent = target.toFixed(1) + suffix;
      } else if (target >= 1000) {
        el.textContent = target.toLocaleString() + suffix;
      } else {
        el.textContent = target.toString() + suffix;
      }
    }
  }

  requestAnimationFrame(tick);
}

export default async function decorate(block) {
  const rows = [...block.children];

  // First row is the heading
  const headingRow = rows[0];
  const headingCell = headingRow.children[0];
  const headingEl = headingCell.querySelector('h1,h2,h3,h4,h5,h6,p,strong');

  // Build heading section
  const headingSection = document.createElement('div');
  headingSection.className = 'stats-counter-heading';
  if (headingEl) {
    headingSection.append(headingEl.cloneNode(true));
  } else {
    const p = document.createElement('p');
    p.textContent = headingCell.textContent.trim();
    headingSection.append(p);
  }

  // Build stats section
  const statsSection = document.createElement('div');
  statsSection.className = 'stats-counter-stats';

  const statItems = [];

  const statRows = rows.slice(1);
  statRows.forEach((row) => {
    const cell = row.children[0];
    const strongEl = cell.querySelector('strong');
    const rawValue = strongEl ? strongEl.textContent.trim() : '';
    const { number, suffix } = parseValue(rawValue);

    // Get label: all text content except the strong element
    let label = '';
    cell.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        label += node.textContent;
      } else if (node.nodeName !== 'STRONG') {
        label += node.textContent;
      }
    });
    label = label.trim();

    // Also check for a <p> that is not the strong
    const pEls = cell.querySelectorAll('p');
    if (!label && pEls.length) {
      pEls.forEach((p) => {
        if (!p.querySelector('strong')) {
          label += p.textContent.trim();
        }
      });
    }

    const statDiv = document.createElement('div');
    statDiv.className = 'stats-counter-item';

    const valueEl = document.createElement('span');
    valueEl.className = 'stats-counter-value';
    valueEl.textContent = number !== null ? '0' + suffix : rawValue;

    const labelEl = document.createElement('span');
    labelEl.className = 'stats-counter-label';
    labelEl.textContent = label;

    statDiv.append(valueEl, labelEl);
    statsSection.append(statDiv);

    if (number !== null) {
      statItems.push({ el: valueEl, target: number, suffix });
    }
  });

  // Clear block and build new structure
  block.innerHTML = '';
  block.append(headingSection, statsSection);

  // Animate on scroll into view
  let animated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statItems.forEach(({ el, target, suffix }) => {
          animateCounter(el, target, suffix);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(block);
}