import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // collect all children from the fragment
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // gather all paragraphs
  const paragraphs = [...footer.querySelectorAll('p')];

  // ── Top row ────────────────────────────────────────────────
  const topRow = document.createElement('div');
  topRow.className = 'footer-top';

  // Brand wordmark (JOLT)
  const brand = document.createElement('span');
  brand.className = 'footer-brand';
  brand.textContent = 'JOLT';
  topRow.append(brand);

  // Nav links — find the paragraph containing anchor tags
  const linkPara = paragraphs.find((p) => p.querySelector('a'));
  if (linkPara) {
    const anchors = [...linkPara.querySelectorAll('a')];
    const nav = document.createElement('ul');
    nav.className = 'footer-nav';
    anchors.forEach((a) => {
      const li = document.createElement('li');
      // re-use the existing anchor element
      li.append(a);
      nav.append(li);
    });
    topRow.append(nav);
  }

  // ── Bottom row: copyright ───────────────────────────────────
  const bottomRow = document.createElement('div');
  bottomRow.className = 'footer-bottom';

  // Find the copyright paragraph (no links, contains '©' or 'copyright' text)
  const copyrightPara = paragraphs.find(
    (p) => !p.querySelector('a') && (p.textContent.includes('©') || /copyright/i.test(p.textContent)),
  );

  if (copyrightPara) {
    copyrightPara.className = 'footer-copyright';
    bottomRow.append(copyrightPara);
  }

  // ── Assemble ────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.append(topRow, bottomRow);
  block.append(wrapper);
}
