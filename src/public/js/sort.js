/**
 * Client-Side Sort Controller.
 * Handles sort selector changes and column header clicks.
 */
document.addEventListener('DOMContentLoaded', () => {
  const sortSelect = document.getElementById('tableSortSelect');

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const sortVal = e.target.value;
      const url = new URL(window.location.href);

      if (sortVal) {
        url.searchParams.set('sort', sortVal);
      } else {
        url.searchParams.delete('sort');
      }

      window.location.href = url.toString();
    });
  }
});
