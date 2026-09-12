/**
 * Global Password Visibility Toggle Helper (Top-Level Scope)
 */
function togglePasswordVisibility(targetId, btnElement) {
  const input = document.getElementById(targetId);
  if (!input) return false;

  // Deduplicate double execution within the same click event (e.g. inline onclick + click listener)
  const now = Date.now();
  if (input._lastToggleTime && (now - input._lastToggleTime) < 300) {
    return false;
  }
  input._lastToggleTime = now;

  const btn = btnElement || document.querySelector(`.password-toggle-btn[data-target="${targetId}"]`);
  const isPassword = input.type === 'password';

  input.type = isPassword ? 'text' : 'password';

  if (btn) {
    btn.innerHTML = isPassword ? '🙈' : '👁️';
    btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    btn.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
  }
  return false;
}
window.togglePasswordVisibility = togglePasswordVisibility;

/**
 * Main Client Initializer.
 * Initializes flash alert dismissal and dynamic UI elements.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Flash Alert Dismissal
  const dismissBtns = document.querySelectorAll('[data-dismiss="alert"]');
  dismissBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const alert = btn.closest('.alert');
      if (alert) alert.remove();
    });
  });

  // Synchronize all password toggle buttons with initial input types
  const toggleBtns = document.querySelectorAll('.password-toggle-btn');
  toggleBtns.forEach((btn) => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input && btn) {
      const isText = input.type === 'text';
      btn.innerHTML = isText ? '🙈' : '👁️';
      btn.setAttribute('aria-label', isText ? 'Hide password' : 'Show password');
      btn.setAttribute('title', isText ? 'Hide password' : 'Show password');

      btn.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        togglePasswordVisibility(targetId, btn);
      });
    }
  });
});
