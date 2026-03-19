export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // Add arrow indicator to all links
  block.querySelectorAll('a').forEach((link) => {
    const arrow = document.createElement('span');
    arrow.textContent = '→';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.style.cssText = 'display:inline-block;transition:transform 250ms ease;font-style:normal;';
    link.appendChild(arrow);

    link.addEventListener('mouseenter', () => {
      arrow.style.transform = 'translateX(4px)';
    });
    link.addEventListener('mouseleave', () => {
      arrow.style.transform = 'translateX(0)';
    });
  });
}
