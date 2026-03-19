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

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // --- Enhanced structure ---

  // Find all paragraphs in the footer content
  const allParagraphs = [...footer.querySelectorAll('p')];

  // Separate copyright from link paragraphs
  const copyrightP = allParagraphs.find((p) => p.textContent.includes('©') || p.textContent.toLowerCase().includes('copyright'));

  // Collect all anchor elements
  const allLinks = [...footer.querySelectorAll('a')];

  // Build top section: brand + tagline
  const topSection = document.createElement('div');
  topSection.className = 'footer-top';

  const brand = document.createElement('span');
  brand.className = 'footer-brand';
  brand.textContent = 'JOLT';
  topSection.append(brand);

  const tagline = document.createElement('p');
  tagline.className = 'footer-tagline';
  tagline.textContent = 'Pioneering the shift to a zero emissions future.';
  topSection.append(tagline);

  // Build divider
  const divider = document.createElement('hr');
  divider.className = 'footer-divider';

  // Build bottom section
  const bottomSection = document.createElement('div');
  bottomSection.className = 'footer-bottom';

  // Copyright
  const copyright = document.createElement('p');
  copyright.textContent = copyrightP
    ? copyrightP.textContent
    : `Copyright \u00A9 ${new Date().getFullYear()} JOLT. All rights reserved.`;
  bottomSection.append(copyright);

  // Links nav
  if (allLinks.length) {
    const nav = document.createElement('ul');
    nav.className = 'footer-links';

    allLinks.forEach((link) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim();
      if (link.target) a.target = link.target;
      li.append(a);
      nav.append(li);
    });

    bottomSection.append(nav);
  }

  // Clear and rebuild footer
  footer.textContent = '';
  footer.append(topSection, divider, bottomSection);

  block.append(footer);
}
