/**
 * Client-Side Form Validation & Real-time Password Strength Meter.
 * Provides client UX feedback before submission while backend re-validates authoritatively.
 */

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const generatePasswordBtn = document.getElementById('generatePasswordBtn');
  const strengthMeterFill = document.getElementById('strengthMeterFill');
  const strengthLabelText = document.getElementById('strengthLabelText');
  const strengthFeedbackList = document.getElementById('strengthFeedbackList');

  // Real-time Password Strength Calculation (Signup Form Only)
  if (signupForm && passwordInput && strengthMeterFill) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      const result = evaluateClientPasswordStrength(val);

      // Update fill bar
      strengthMeterFill.className = 'strength-meter-fill ' + result.label.toLowerCase();

      // Update label
      if (strengthLabelText) {
        strengthLabelText.innerHTML = `<span>Strength: <strong>${result.label}</strong></span><span>${result.score}/5</span>`;
      }

      // Update feedback guidance list
      if (strengthFeedbackList) {
        if (result.feedback.length === 0 || !val) {
          strengthFeedbackList.innerHTML = val ? '<li>✓ Password meets security recommendations</li>' : '';
        } else {
          strengthFeedbackList.innerHTML = result.feedback.map((f) => `<li>• ${f}</li>`).join('');
        }
      }
    });
  }

  // Real-time Confirm Password Match Check
  const checkPasswordMatch = () => {
    if (!passwordInput || !confirmPasswordInput) return;
    const pwd = passwordInput.value;
    const confirm = confirmPasswordInput.value;
    let matchFeedback = document.getElementById('matchFeedbackText');

    if (!matchFeedback) {
      matchFeedback = document.createElement('div');
      matchFeedback.id = 'matchFeedbackText';
      matchFeedback.style.fontSize = '0.78rem';
      matchFeedback.style.marginTop = '0.35rem';
      matchFeedback.style.fontWeight = '500';
      confirmPasswordInput.parentNode.parentNode.appendChild(matchFeedback);
    }

    if (!confirm) {
      matchFeedback.innerHTML = '';
      confirmPasswordInput.classList.remove('is-invalid');
    } else if (pwd === confirm) {
      matchFeedback.innerHTML = '<span style="color: #1B5E34;">✓ Passwords match</span>';
      confirmPasswordInput.classList.remove('is-invalid');
    } else {
      matchFeedback.innerHTML = '<span style="color: var(--color-red-accent);">⚠️ Passwords do not match</span>';
    }
  };

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    if (passwordInput) passwordInput.addEventListener('input', () => {
      if (confirmPasswordInput.value) checkPasswordMatch();
    });
  }

  // Client-Side Strong Password Generator Button
  if (generatePasswordBtn && passwordInput) {
    generatePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const generatedPassword = generateRandomStrongPassword();
      passwordInput.value = generatedPassword;
      if (confirmPasswordInput) {
        confirmPasswordInput.value = generatedPassword;
        checkPasswordMatch();
      }
      // Trigger input event to recalculate meter
      passwordInput.dispatchEvent(new Event('input'));
      if (window.showToast) {
        window.showToast('⚡ Strong password generated and filled into fields!', 'info');
      }
    });
  }

  // Client-Side Form Submit Guard
  if (signupForm && passwordInput && confirmPasswordInput) {
    signupForm.addEventListener('submit', (e) => {
      if (passwordInput.value !== confirmPasswordInput.value) {
        e.preventDefault();
        confirmPasswordInput.classList.add('is-invalid');
        checkPasswordMatch();
        if (window.showToast) {
          window.showToast('Please verify that your passwords match before submitting.', 'error');
        } else {
          alert('Passwords do not match. Please verify your entries.');
        }
      }
    });
  }
});

function evaluateClientPasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'Weak', feedback: ['Enter a password'] };
  }

  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add an uppercase letter');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add a lowercase letter');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add a number');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Add a special character (!@#$%^&*)');

  let label = 'Weak';
  if (score >= 4) label = 'Strong';
  else if (score >= 3) label = 'Good';
  else if (score >= 2) label = 'Fair';

  return { score, label, feedback };
}

function generateRandomStrongPassword() {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-=';

  const getRandom = (str) => str.charAt(Math.floor(Math.random() * str.length));

  let pwd = [
    getRandom(uppers),
    getRandom(lowers),
    getRandom(numbers),
    getRandom(symbols),
  ];

  const allChars = uppers + lowers + numbers + symbols;
  for (let i = 4; i < 14; i++) {
    pwd.push(getRandom(allChars));
  }

  // Shuffle
  return pwd.sort(() => 0.5 - Math.random()).join('');
}
