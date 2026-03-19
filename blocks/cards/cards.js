import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';

        // Find the title — bold text or first strong element or first paragraph
        const titleEl = div.querySelector('strong') || div.querySelector('p:first-child');
        if (titleEl) {
          // Ensure the title paragraph is the first child for correct styling
          if (titleEl.tagName === 'STRONG' && titleEl.closest('p')) {
            titleEl.closest('p').classList.add('cards-card-title');
          } else if (titleEl.tagName === 'P') {
            titleEl.classList.add('cards-card-title');
          }
        }
      }
    });

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    )
  );

  block.replaceChildren(ul);
}
