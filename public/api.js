
// Change this to your deployed backend URL when you deploy
const API_BASE = 'http://localhost:5000/api';


const getToken = () => localStorage.getItem('hawleek_token');
const getUser  = () => JSON.parse(localStorage.getItem('hawleek_user') || 'null');
const setAuth  = (token, user) => {
  localStorage.setItem('hawleek_token', token);
  localStorage.setItem('hawleek_user', JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('hawleek_token');
  localStorage.removeItem('hawleek_user');
};

async function apiRequest(method, endpoint, body = null, isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const options = { method, headers };
  if (body) options.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

const API = {
  get:    (url)               => apiRequest('GET',    url),
  post:   (url, body)         => apiRequest('POST',   url, body),
  put:    (url, body)         => apiRequest('PUT',    url, body),
  patch:  (url, body)         => apiRequest('PATCH',  url, body),
  delete: (url)               => apiRequest('DELETE', url),
  upload: (url, formData, method = 'POST') => apiRequest(method, url, formData, true),
};


function showToast(message, type = 'success') {

  const old = document.getElementById('hawleek-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'hawleek-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: #fff; padding: 14px 22px; border-radius: 10px;
    font-family: sans-serif; font-size: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease; max-width: 340px;
  `;
  document.head.insertAdjacentHTML('beforeend',
    `<style>@keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}</style>`
  );
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function showSpinner(btn) {
  if (!btn) return;
  btn._originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Loading...';
}

function hideSpinner(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = btn._originalText || 'Submit';
}


function requireAuth() {
  if (!getToken()) {
    window.location.href = '/Homepage /login.html';
  }
}
function requireRole(...roles) {
  const user = getUser();
  if (!user || !roles.includes(user.role)) {
    showToast('Access denied', 'error');
    setTimeout(() => (window.location.href = '/Homepage /index.html'), 1500);
  }
}

function updateNav() {
  const user = getUser();
  const loginLinks  = document.querySelectorAll('[data-show="guest"]');
  const logoutLinks = document.querySelectorAll('[data-show="auth"]');
  const userNameEls = document.querySelectorAll('[data-user-name]');
  const adminLinks  = document.querySelectorAll('[data-show="admin"]');
  const ownerLinks  = document.querySelectorAll('[data-show="owner"]');

  if (user) {
    loginLinks.forEach(el  => el.style.display  = 'none');
    logoutLinks.forEach(el => el.style.display = '');
    userNameEls.forEach(el => el.textContent    = user.name);
    if (user.role === 'admin')          adminLinks.forEach(el => el.style.display = '');
    if (user.role === 'business_owner') ownerLinks.forEach(el => el.style.display = '');
  } else {
    loginLinks.forEach(el  => el.style.display  = '');
    logoutLinks.forEach(el => el.style.display = 'none');
  }
}

function logout() {
  clearAuth();
  showToast('Logged out successfully');
  setTimeout(() => (window.location.href = '/Homepage /index.html'), 1000);
}

function renderPagination(containerId, pagination, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container || pagination.totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '<div style="display:flex;gap:8px;justify-content:center;margin-top:20px;flex-wrap:wrap">';
  for (let i = 1; i <= pagination.totalPages; i++) {
    const active = i === pagination.page;
    html += `<button onclick="(${onPageChange.toString()})(${i})"
      style="padding:8px 14px;border-radius:8px;border:1px solid ${active ? '#0f6e56' : '#ddd'};
      background:${active ? '#0f6e56' : '#fff'};color:${active ? '#fff' : '#333'};cursor:pointer;">
      ${i}</button>`;
  }
  html += '</div>';
  container.innerHTML = html;
}


document.addEventListener('DOMContentLoaded', updateNav);
