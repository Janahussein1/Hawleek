
// Include api.js BEFORE this file in your HTML

document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type="submit"]');
      showSpinner(btn);

      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

     
      if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        hideSpinner(btn);
        return;
      }

      try {
        const data = await API.post('/auth/login', { email, password });
        setAuth(data.token, data.user);
        showToast('Welcome back, ' + data.user.name + '!');

        
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/dashboard/admin.html';
          } else if (data.user.role === 'business_owner') {
            window.location.href = '/dashboard/owner.html';
          } else {
            window.location.href = '/';
          }
        }, 1000);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        hideSpinner(btn);
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector('button[type="submit"]');
      showSpinner(btn);

      const name         = document.getElementById('name').value.trim();
      const email        = document.getElementById('email').value.trim();
      const password     = document.getElementById('password').value;
      const confirmPass  = document.getElementById('confirm-password')?.value;
      const role         = document.getElementById('role')?.value || 'resident';
      const neighborhood = document.getElementById('neighborhood')?.value.trim();
      const phone        = document.getElementById('phone')?.value.trim();
      const businessName = document.getElementById('business-name')?.value.trim();

     
      if (!name || !email || !password) {
        showToast('Please fill in all required fields', 'error');
        hideSpinner(btn);
        return;
      }

      if (confirmPass && password !== confirmPass) {
        showToast('Passwords do not match', 'error');
        hideSpinner(btn);
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        hideSpinner(btn);
        return;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        hideSpinner(btn);
        return;
      }

      try {
        const data = await API.post('/auth/register', {
          name, email, password, role, neighborhood, phone, businessName,
        });

        setAuth(data.token, data.user);
        showToast('Account created! Welcome to Hawleek 🎉');

        setTimeout(() => {
          if (data.user.role === 'business_owner') {
            window.location.href = '/dashboard/owner.html';
          } else {
            window.location.href = '/';
          }
        }, 1200);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        hideSpinner(btn);
      }
    });

    
    const roleSelect = document.getElementById('role');
    const businessField = document.getElementById('business-name-group');
    if (roleSelect && businessField) {
      roleSelect.addEventListener('change', () => {
        businessField.style.display = roleSelect.value === 'business_owner' ? '' : 'none';
      });
    }
  }
});
