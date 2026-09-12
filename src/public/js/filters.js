/**
 * Client-Side Filter Controls Controller.
 * Listens for dropdown changes on status/category filters and updates window location.
 */
document.addEventListener('DOMContentLoaded', () => {
  const filterSelects = document.querySelectorAll('.table-filter-select');

  filterSelects.forEach((select) => {
    select.addEventListener('change', (e) => {
      const paramName = e.target.name;
      const paramValue = e.target.value;
      const url = new URL(window.location.href);

      if (paramValue) {
        url.searchParams.set(paramName, paramValue);
      } else {
        url.searchParams.delete(paramName);
      }

      url.searchParams.set('page', '1');
      window.location.href = url.toString();
    });
  });
});
