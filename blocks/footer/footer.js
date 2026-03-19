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

  // Wrap content in a structured bottom bar
  const allParagraphs = [...footer.querySelectorAll('p')];

  // Find the copyright paragraph and the links paragraph
  let copyrightEl = null;
  let linksEl = null;

  allParagraphs.forEach((p) => {
    const text = p.textContent || '';
    if (text.toLowerCase().includes('copyright') || text.includes('©')) {
      copyrightEl = p;
    } else if (p.querySelector('a')) {
      linksEl = p;
    }
  });

  // Build the footer bottom section
  const bottomBar = document.createElement('div');
  bottomBar.className = 'footer-bottom';

  if (copyrightEl) {
    copyrightEl.className = 'footer-copyright';
    bottomBar.append(copyrightEl);
  }

  // Convert link paragraph into a semantic nav list
  if (linksEl) {
    const links = [...linksEl.querySelectorAll('a')];
    if (links.length > 0) {
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'Footer navigation');
      const ul = document.createElement('ul');
      ul.className = 'footer-links';

      links.forEach((a) => {
        const li = document.createElement('li');
        // Re-use the existing anchor element
        li.append(a);
        ul.append(li);
      });

      nav.append(ul);
      bottomBar.append(nav);
      linksEl.remove();
    }
  }

  footer.append(bottomBar);
  block.append(footer);
}
