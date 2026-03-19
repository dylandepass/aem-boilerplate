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

        // Identify the title: first <p> or <strong> acting as heading
        // Wrap bold text in a <p> if needed for consistent styling
        const firstP = div.querySelector('p');
        if (firstP) {
          const strong = firstP.querySelector('strong');
          if (strong && firstP.children.length === 1) {
            // The whole paragraph is a bold title — unwrap strong into p for CSS targeting
            firstP.classList.add('cards-card-title');
          } else if (!strong) {
            // Plain paragraph as title
            firstP.classList.add('cards-card-title');
          }
        }
      }
    });

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
  ));

  block.replaceChildren(ul);
}
