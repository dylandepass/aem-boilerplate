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

      // Detect and tag anchor links as buttons if they appear alone in a <p>
      const anchors = col.querySelectorAll('p > a');
      anchors.forEach((a) => {
        const parentP = a.parentElement;
        if (parentP && parentP.children.length === 1 && parentP.textContent.trim() === a.textContent.trim()) {
          a.classList.add('button');
        }
      });
    });
  });
}
