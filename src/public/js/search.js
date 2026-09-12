/**
 * Client-Side Search Controller.
 * Attaches debounced listener to search input to update URL query string without reloading page state unnecessarily.
 */
document.addEventListener('DOMContentLoaded', () => {
  const searchInputs = document.querySelectorAll('input[name="search"], [data-search-input], #tableSearchInput');
  if (!searchInputs || searchInputs.length === 0) return;

  searchInputs.forEach((input) => {
    const handleSearch = debounce((e) => {
      const term = e.target.value;
      const form = e.target.closest('form');
      if (form) {
        form.submit();
        return;
      }

      const url = new URL(window.location.href);
      if (term.trim()) {
        url.searchParams.set('search', term.trim());
      } else {
        url.searchParams.delete('search');
      }
      url.searchParams.set('page', '1');
      window.location.href = url.toString();
    }, 450);

    input.addEventListener('input', handleSearch);
  });
});
