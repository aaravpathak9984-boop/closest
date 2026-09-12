// Reusable debounce utility function

function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = debounce;
}
