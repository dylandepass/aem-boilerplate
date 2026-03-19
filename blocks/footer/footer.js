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

  // collect all raw children from fragment
  block.textContent = '';
  const raw = document.createElement('div');
  while (fragment.firstElementChild) raw.append(fragment.firstElementChild);

  // --- Parse existing content ---
  // Gather all links from the fragment
  const allLinks = [...raw.querySelectorAll('a')];

  // Copyright: find the paragraph containing ©
  let copyrightText = 'Copyright © 2021 Adobe. All rights reserved.';
  raw.querySelectorAll('p').forEach((p) => {
    if (p.textContent.includes('©') || p.textContent.toLowerCase().includes('copyright')) {
      copyrightText = p.textContent.trim();
    }
  });

  // Legal links: Privacy, Terms, Cookie, Do not sell, AdChoices etc.
  const legalKeywords = ['privacy', 'terms', 'cookie', 'sell', 'adchoice', 'legal', 'accessibility'];
  const legalLinks = allLinks.filter((a) =>
    legalKeywords.some((kw) => a.textContent.toLowerCase().includes(kw) || a.href.toLowerCase().includes(kw))
  );
  const legalHrefs = new Set(legalLinks.map((a) => a.href));

  // Nav links: everything that isn't a legal link
  const navLinks = allLinks.filter((a) => !legalHrefs.has(a.href));

  // --- Build footer structure ---
  const footer = document.createElement('div');

  // Top row
  const top = document.createElement('div');
  top.className = 'footer-top';

  // Brand column
  const brand = document.createElement('div');
  brand.className = 'footer-brand';

  const brandName = document.createElement('span');
  brandName.className = 'footer-brand-name';
  brandName.textContent = 'JOLT';

  const brandTagline = document.createElement('span');
  brandTagline.className = 'footer-brand-tagline';
  brandTagline.textContent = 'Pioneering the shift to a zero emissions future.';

  brand.append(brandName, brandTagline);

  // Nav links
  const nav = document.createElement('ul');
  nav.className = 'footer-nav';

  if (navLinks.length > 0) {
    navLinks.forEach((a) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent.trim();
      li.append(link);
      nav.append(li);
    });
  }

  top.append(brand);
  if (navLinks.length > 0) top.append(nav);

  // Bottom bar
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';

  const copyright = document.createElement('p');
  copyright.className = 'footer-copyright';
  copyright.textContent = copyrightText;

  const legal = document.createElement('ul');
  legal.className = 'footer-legal';

  if (legalLinks.length > 0) {
    legalLinks.forEach((a) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent.trim();
      li.append(link);
      legal.append(li);
    });
  } else {
    // Fallback: render all links as legal if no nav links either
    allLinks.forEach((a) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent.trim();
      li.append(link);
      legal.append(li);
    });
  }

  bottom.append(copyright);
  if (legal.children.length > 0) bottom.append(legal);

  footer.append(top, bottom);
  block.append(footer);
}
