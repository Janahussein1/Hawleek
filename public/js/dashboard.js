
// Include api.js BEFORE this file in your HTML

document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  if (!user) { requireAuth(); return; }

  if (user.role === 'admin')               loadAdminDashboard();
  else if (user.role === 'business_owner') loadOwnerDashboard();
  else                                     loadResidentDashboard();
});


async function loadResidentDashboard() {
  const user = getUser();
  const nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.textContent = user.name;

  await Promise.all([loadMyBookings(), loadMyReviews(), loadProfile()]);
}

async function loadMyBookings(page = 1) {
  const container = document.getElementById('my-bookings');
  if (!container) return;

  try {
    const data     = await API.get(`/users/my-bookings?page=${page}&limit=10`);
    const bookings = data.data;

    if (bookings.length === 0) {
      container.innerHTML = '<p style="color:#888">No bookings yet. <a href="/">Explore places</a></p>';
    }

    container.innerHTML = bookings.map(b => {
      const statusColor = { pending:'#f59e0b', confirmed:'#22c55e', cancelled:'#ef4444', completed:'#6366f1' }[b.status] || '#888';
      return `
        <div style="border:1px solid #eee;border-radius:10px;padding:16px;display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px;margin-bottom:10px">
          <div>
            <strong>${b.place?.name || 'Unknown Place'}</strong>
            <p style="margin:4px 0;font-size:13px;color:#888;text-transform:capitalize">
              ${b.type} · ${new Date(b.date).toLocaleDateString()} at ${b.time}
            </p>
            ${b.partySize > 1 ? `<p style="margin:0;font-size:13px;color:#888">Party of ${b.partySize}</p>` : ''}
            ${b.totalPrice > 0 ? `<p style="margin:0;font-size:13px;color:#0f6e56;font-weight:600">EGP ${b.totalPrice}</p>` : ''}
          </div>
          <div style="text-align:right">
            <span style="background:${statusColor}22;color:${statusColor};padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize">
              ${b.status}</span>
            ${b.status === 'pending' || b.status === 'confirmed'
              ? `<br><button onclick="cancelBooking('${b._id}')"
                  style="margin-top:8px;padding:6px 12px;background:#fee2e2;color:#ef4444;border:1px solid #fca5a5;border-radius:6px;cursor:pointer;font-size:12px">
                  Cancel</button>`
              : ''}
          </div>
        </div>`;
    }).join('');

    renderPagination('bookings-pagination', data.pagination, loadMyBookings);
  } catch (err) {
    container.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  try {
    await API.put(`/bookings/${bookingId}/cancel`);
    showToast('Booking cancelled. A confirmation email has been sent.');
    loadMyBookings();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadMyReviews() {
  const container = document.getElementById('my-reviews');
  if (!container) return;

  try {
    const data    = await API.get('/users/my-reviews');
    const reviews = data.data;

    if (reviews.length === 0) {
      container.innerHTML = "<p style='color:#888'>You haven't reviewed any places yet.</p>";
      return;
    }

    container.innerHTML = reviews.map(r => `
      <div style="border:1px solid #eee;border-radius:10px;padding:16px;display:flex;justify-content:space-between;align-items:start;margin-bottom:10px">
        <div>
          <strong>${r.place?.name || 'Unknown'}</strong>
          <span style="color:#f59e0b;margin-left:8px">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          ${r.comment ? `<p style="margin:6px 0 0;font-size:13px;color:#555">${r.comment}</p>` : ''}
          <p style="margin:4px 0 0;font-size:12px;color:#aaa">${new Date(r.createdAt).toLocaleDateString()}</p>
        </div>
        <button onclick="deleteMyReview('${r._id}')"
          style="padding:6px 12px;background:#fee2e2;color:#ef4444;border:1px solid #fca5a5;border-radius:6px;cursor:pointer;font-size:12px">
          Delete</button>
      </div>`).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

async function deleteMyReview(reviewId) {
  if (!confirm('Delete this review?')) return;
  try {
    await API.delete(`/reviews/${reviewId}`);
    showToast('Review deleted');
    loadMyReviews();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadProfile() {
  const form = document.getElementById('profile-form');
  if (!form) return;

  try {
    const data = await API.get('/users/profile');
    const u    = data.data;
    const set  = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('profile-name',         u.name);
    set('profile-email',        u.email);
    set('profile-phone',        u.phone);
    set('profile-neighborhood', u.neighborhood);

    const avatar = document.getElementById('profile-avatar');
    if (avatar && u.avatar) avatar.src = `${u.avatar}`;
  } catch (err) {
    showToast('Could not load profile', 'error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    showSpinner(btn);
    try {
      await API.put('/users/profile', {
        name:         document.getElementById('profile-name')?.value,
        phone:        document.getElementById('profile-phone')?.value,
        neighborhood: document.getElementById('profile-neighborhood')?.value,
      });
      showToast('Profile updated!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      hideSpinner(btn);
    }
  });

 
  const avatarInput = document.getElementById('avatar-input');
  if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('avatar', file);
      try {
        const data   = await API.upload('/users/avatar', formData, 'PUT');
        const avatar = document.getElementById('profile-avatar');
        if (avatar) avatar.src = `${data.data.avatar}`;
        showToast('Avatar updated!');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  const pwForm = document.getElementById('change-password-form');
  if (pwForm) {
    pwForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = pwForm.querySelector('button[type="submit"]');
      const currentPassword = document.getElementById('current-password')?.value;
      const newPassword     = document.getElementById('new-password')?.value;
      const confirmPassword = document.getElementById('confirm-new-password')?.value;

      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
      }
      if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }

      showSpinner(btn);
      try {
        await API.put('/auth/updatepassword', { currentPassword, newPassword });
        showToast('Password updated successfully!');
        pwForm.reset();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        hideSpinner(btn);
      }
    });
  }
}


async function loadOwnerDashboard() {
  requireRole('business_owner', 'admin');
  await loadMyPlaces();
  setupAddPlaceForm();
}

async function loadMyPlaces() {
  const container = document.getElementById('my-places');
  if (!container) return;

  try {
    const data   = await API.get('/places/owner/my-places');
    const places = data.data;

    if (places.length === 0) {
      container.innerHTML = '<p style="color:#888">No places yet. Add your first place below.</p>';
      return;
    }

    container.innerHTML = places.map(p => `
      <div style="border:1px solid #eee;border-radius:10px;padding:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:10px">
        <div>
          <strong>${p.name}</strong>
          ${p.isVerified
            ? '<span style="color:#22c55e;font-size:12px;margin-left:8px">✓ Verified</span>'
            : '<span style="color:#f59e0b;font-size:12px;margin-left:8px">⏳ Pending verification</span>'}
          <p style="margin:4px 0;font-size:13px;color:#888;text-transform:capitalize">${p.type} · ${p.neighborhood}</p>
          <p style="margin:0;font-size:13px;color:#888">⭐ ${p.averageRating} · ${p.reviewCount} reviews</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button onclick="viewPlaceBookings('${p._id}', '${p.name}')"
            style="padding:8px 14px;background:#e0f2fe;color:#0369a1;border:none;border-radius:8px;cursor:pointer;font-size:13px">📅 Bookings</button>
          <button onclick="openEditPlace('${p._id}')"
            style="padding:8px 14px;background:#f0fdf4;color:#166534;border:none;border-radius:8px;cursor:pointer;font-size:13px">✏️ Edit</button>
          <button onclick="deleteMyPlace('${p._id}')"
            style="padding:8px 14px;background:#fee2e2;color:#ef4444;border:none;border-radius:8px;cursor:pointer;font-size:13px">🗑️ Delete</button>
        </div>
      </div>`).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

async function viewPlaceBookings(placeId, placeName) {
  const container = document.getElementById('place-bookings');
  const header    = document.getElementById('place-bookings-title');
  if (!container) return;

  if (header) header.textContent = `Bookings for ${placeName}`;
  container.innerHTML = '<p style="color:#888">Loading bookings...</p>';

  
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const data     = await API.get(`/bookings/place/${placeId}?limit=50`);
    const bookings = data.data;

    if (bookings.length === 0) {
      container.innerHTML = '<p style="color:#888">No bookings for this place.</p>';
      return;
    }

    container.innerHTML = bookings.map(b => {
      const statusColor = { pending:'#f59e0b', confirmed:'#22c55e', cancelled:'#ef4444', completed:'#6366f1' }[b.status] || '#888';
      return `
        <div style="border:1px solid #eee;border-radius:10px;padding:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
          <div>
            <strong>${b.user?.name || 'Guest'}</strong>
            <span style="color:#888;font-size:12px;margin-left:8px">${b.user?.email || ''} ${b.user?.phone ? '· ' + b.user.phone : ''}</span>
            <p style="margin:4px 0;font-size:13px;color:#888">
              ${new Date(b.date).toLocaleDateString()} at ${b.time}
              · <span style="text-transform:capitalize">${b.type}</span>
              ${b.partySize > 1 ? `(${b.partySize} people)` : ''}
              ${b.seatsBooked > 1 ? `· ${b.seatsBooked} seats` : ''}
            </p>
            ${b.notes ? `<p style="margin:0;font-size:12px;color:#888;font-style:italic">"${b.notes}"</p>` : ''}
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <span style="background:${statusColor}22;color:${statusColor};padding:4px 10px;border-radius:20px;font-size:12px;text-transform:capitalize">
              ${b.status}</span>
            ${b.status === 'pending'
              ? `<button onclick="updateStatus('${b._id}','confirmed','${placeId}','${placeName}')"
                  style="padding:6px 12px;background:#dcfce7;color:#166534;border:none;border-radius:6px;cursor:pointer;font-size:12px">Confirm</button>
                 <button onclick="updateStatus('${b._id}','cancelled','${placeId}','${placeName}')"
                  style="padding:6px 12px;background:#fee2e2;color:#ef4444;border:none;border-radius:6px;cursor:pointer;font-size:12px">Cancel</button>`
              : b.status === 'confirmed'
              ? `<button onclick="updateStatus('${b._id}','completed','${placeId}','${placeName}')"
                  style="padding:6px 12px;background:#ede9fe;color:#7c3aed;border:none;border-radius:6px;cursor:pointer;font-size:12px">Complete</button>`
              : ''}
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

async function updateStatus(bookingId, status, placeId, placeName) {
  try {
    await API.put(`/bookings/${bookingId}/status`, { status });
    showToast(`Booking marked as ${status} — user notified by email`);
    if (placeId) {
      viewPlaceBookings(placeId, placeName || '');
    } else {
      loadAdminBookings();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteMyPlace(placeId) {
  if (!confirm('Remove this place? This action cannot be undone.')) return;
  try {
    await API.delete(`/places/${placeId}`);
    showToast('Place removed');
    loadMyPlaces();
  } catch (err) {
    showToast(err.message, 'error');
  }
}


async function openEditPlace(placeId) {
  const panel = document.getElementById('edit-place-panel');
  if (!panel) {
    
    createEditPanel(placeId);
    return;
  }
  panel.style.display = 'block';
  panel.innerHTML     = '<p style="color:#888">Loading...</p>';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const data  = await API.get(`/places/${placeId}`);
    const place = data.data;
    panel.innerHTML = buildEditForm(place);
    setupEditFormSubmit(placeId, panel);
  } catch (err) {
    panel.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

async function createEditPanel(placeId) {
  
  const existing = document.getElementById('edit-place-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id    = 'edit-place-modal';
  modal.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);
    z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;`;

  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;position:relative;">
      <button onclick="document.getElementById('edit-place-modal').remove()"
        style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:#888">✕</button>
      <h2 style="margin:0 0 20px;color:#1a1a1a">Edit Place</h2>
      <div id="edit-place-inner"><p style="color:#888">Loading...</p></div>
    </div>`;

  document.body.appendChild(modal);

  try {
    const data  = await API.get(`/places/${placeId}`);
    const place = data.data;
    document.getElementById('edit-place-inner').innerHTML = buildEditForm(place);
    setupEditFormSubmit(placeId, document.getElementById('edit-place-inner'));
  } catch (err) {
    document.getElementById('edit-place-inner').innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

function buildEditForm(place) {
  const types = ['restaurant', 'cafe', 'clinic', 'station', 'pharmacy', 'gym', 'other'];
  return `
    <div style="display:grid;gap:14px">
      <div>
        <label style="font-size:13px;color:#555;display:block;margin-bottom:4px">Place Name *</label>
        <input id="edit-name" value="${place.name}" required
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:14px">
      </div>
      <div>
        <label style="font-size:13px;color:#555;display:block;margin-bottom:4px">Type *</label>
        <select id="edit-type"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:14px">
          ${types.map(t => `<option value="${t}" ${place.type === t ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:13px;color:#555;display:block;margin-bottom:4px">Neighborhood *</label>
        <input id="edit-neighborhood" value="${place.neighborhood}" required
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:14px">
      </div>
      <div>
        <label style="font-size:13px;color:#555;display:block;margin-bottom:4px">Address *</label>
        <input id="edit-address" value="${place.address}" required
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:14px">
      </div>
      <div>
        <label style="font-size:13px;color:#555;display:block;margin-bottom:4px">Phone</label>
        <input id="edit-phone" value="${place.phone || ''}"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:14px">
      </div>
      <div>
        <label style="font-size:13px;color:#555;display:block;margin-bottom:4px">Opening Hours</label>
        <input id="edit-hours" value="${place.openingHours || ''}" placeholder="e.g. 9:00 AM - 10:00 PM"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:14px">
      </div>
      <div>
        <label style="font-size:13px;color:#555;display:block;margin-bottom:4px">Description</label>
        <textarea id="edit-description" rows="3"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:14px;resize:vertical">${place.description || ''}</textarea>
      </div>
      <div>
        <label style="font-size:13px;color:#555;display:block;margin-bottom:4px">Cover Image (optional)</label>
        <input type="file" id="edit-coverImage" accept="image/*"
          style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box">
      </div>
      <div style="display:flex;gap:10px;margin-top:4px">
        <button id="edit-save-btn" type="button"
          style="flex:1;padding:12px;background:#0f6e56;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600">
          Save Changes</button>
        <button type="button" onclick="document.getElementById('edit-place-modal')?.remove()"
          style="padding:12px 20px;background:#eee;color:#555;border:none;border-radius:8px;cursor:pointer;font-size:14px">
          Cancel</button>
      </div>
    </div>`;
}

function setupEditFormSubmit(placeId, container) {
  const btn = container.querySelector('#edit-save-btn') || document.getElementById('edit-save-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const formData = new FormData();
    formData.append('name',         document.getElementById('edit-name')?.value         || '');
    formData.append('type',         document.getElementById('edit-type')?.value         || '');
    formData.append('neighborhood', document.getElementById('edit-neighborhood')?.value  || '');
    formData.append('address',      document.getElementById('edit-address')?.value      || '');
    formData.append('phone',        document.getElementById('edit-phone')?.value        || '');
    formData.append('openingHours', document.getElementById('edit-hours')?.value        || '');
    formData.append('description',  document.getElementById('edit-description')?.value  || '');

    const coverFile = document.getElementById('edit-coverImage')?.files[0];
    if (coverFile) formData.append('coverImage', coverFile);

    showSpinner(btn);
    try {
      await API.upload(`/places/${placeId}`, formData, 'PUT');
      showToast('Place updated successfully!');
      document.getElementById('edit-place-modal')?.remove();
      loadMyPlaces();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      hideSpinner(btn);
    }
  });
}


function setupAddPlaceForm() {
  const addPlaceForm = document.getElementById('add-place-form');
  if (!addPlaceForm) return;

  addPlaceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = addPlaceForm.querySelector('button[type="submit"]');
    showSpinner(btn);

    const formData = new FormData(addPlaceForm);
    try {
      await API.upload('/places', formData, 'POST');
      showToast('Place added successfully! 🎉 It will appear after admin verification.');
      addPlaceForm.reset();
      loadMyPlaces();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      hideSpinner(btn);
    }
  });
}


async function loadAdminDashboard() {
  requireRole('admin');

  try {
    const data = await API.get('/admin/dashboard');
    const { stats, recentBookings, recentUsers } = data.data;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-users',            stats.totalUsers);
    set('stat-places',           stats.totalPlaces);
    set('stat-bookings',         stats.totalBookings);
    set('stat-reviews',          stats.totalReviews);
    set('stat-pending-places',   stats.pendingPlaces);
    set('stat-pending-bookings', stats.pendingBookings);

    const rb = document.getElementById('recent-bookings');
    if (rb) {
      rb.innerHTML = recentBookings.map(b => `
        <tr>
          <td style="padding:10px">${b.user?.name || 'N/A'}</td>
          <td style="padding:10px">${b.place?.name || 'N/A'}</td>
          <td style="padding:10px;text-transform:capitalize">${b.type}</td>
          <td style="padding:10px">${new Date(b.date).toLocaleDateString()}</td>
          <td style="padding:10px;text-transform:capitalize">${b.status}</td>
        </tr>`).join('');
    }

    const ru = document.getElementById('recent-users');
    if (ru) {
      ru.innerHTML = recentUsers.map(u => `
        <tr>
          <td style="padding:10px">${u.name}</td>
          <td style="padding:10px">${u.email}</td>
          <td style="padding:10px;text-transform:capitalize">${u.role.replace('_', ' ')}</td>
          <td style="padding:10px">${new Date(u.createdAt).toLocaleDateString()}</td>
        </tr>`).join('');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }

  loadAdminPlaces();
  loadAdminUsers();
  loadAdminBookings();
}

async function loadAdminPlaces(page = 1) {
  const container = document.getElementById('admin-places');
  if (!container) return;

  const search   = document.getElementById('admin-place-search')?.value  || '';
  const type     = document.getElementById('admin-place-type')?.value    || '';
  const verified = document.getElementById('admin-place-verified')?.value || '';

  const params = new URLSearchParams({ page, limit: 20 });
  if (search)   params.set('search', search);
  if (type)     params.set('type', type);
  if (verified) params.set('verified', verified);

  try {
    const data = await API.get(`/admin/places?${params}`);
    container.innerHTML = data.data.map(p => `
      <tr>
        <td style="padding:10px">${p.name}</td>
        <td style="padding:10px;text-transform:capitalize">${p.type}</td>
        <td style="padding:10px">${p.neighborhood}</td>
        <td style="padding:10px">${p.owner?.name || 'N/A'}</td>
        <td style="padding:10px">${p.isVerified
          ? '<span style="color:#22c55e">✓ Verified</span>'
          : '<span style="color:#f59e0b">Pending</span>'}</td>
        <td style="padding:10px">
          ${!p.isVerified
            ? `<button onclick="verifyPlace('${p._id}')"
                style="padding:5px 10px;background:#dcfce7;color:#166534;border:none;border-radius:6px;cursor:pointer;font-size:12px;margin-right:6px">Verify</button>`
            : ''}
          <button onclick="adminDeletePlace('${p._id}')"
            style="padding:5px 10px;background:#fee2e2;color:#ef4444;border:none;border-radius:6px;cursor:pointer;font-size:12px">Remove</button>
        </td>
      </tr>`).join('');

    renderPagination('admin-places-pagination', data.pagination, loadAdminPlaces);
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="color:red;padding:10px">${err.message}</td></tr>`;
  }
}

async function verifyPlace(placeId) {
  try {
    await API.put(`/admin/places/${placeId}/verify`);
    showToast('Place verified ✓');
    loadAdminPlaces();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function adminDeletePlace(placeId) {
  if (!confirm('Remove this place from the platform?')) return;
  try {
    await API.delete(`/admin/places/${placeId}`);
    showToast('Place removed');
    loadAdminPlaces();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAdminUsers(page = 1) {
  const container = document.getElementById('admin-users');
  if (!container) return;

  const search = document.getElementById('admin-user-search')?.value || '';
  const role   = document.getElementById('admin-user-role')?.value   || '';

  const params = new URLSearchParams({ page, limit: 20 });
  if (search) params.set('search', search);
  if (role)   params.set('role', role);

  try {
    const data = await API.get(`/admin/users?${params}`);
    container.innerHTML = data.data.map(u => `
      <tr>
        <td style="padding:10px">${u.name}</td>
        <td style="padding:10px">${u.email}</td>
        <td style="padding:10px;text-transform:capitalize">${u.role.replace('_', ' ')}</td>
        <td style="padding:10px">${u.neighborhood || '—'}</td>
        <td style="padding:10px">
          <span style="color:${u.isActive ? '#22c55e' : '#ef4444'}">${u.isActive ? 'Active' : 'Inactive'}</span>
        </td>
        <td style="padding:10px">
          <select onchange="changeRole('${u._id}', this.value)"
            style="padding:4px;border:1px solid #ddd;border-radius:6px;font-size:12px;margin-right:6px">
            <option value="resident"       ${u.role==='resident'       ? 'selected':''}>Resident</option>
            <option value="business_owner" ${u.role==='business_owner' ? 'selected':''}>Owner</option>
            <option value="admin"          ${u.role==='admin'          ? 'selected':''}>Admin</option>
          </select>
          <button onclick="toggleUser('${u._id}')"
            style="padding:5px 10px;background:${u.isActive?'#fee2e2':'#dcfce7'};
            color:${u.isActive?'#ef4444':'#166534'};border:none;border-radius:6px;cursor:pointer;font-size:12px">
            ${u.isActive ? 'Deactivate' : 'Activate'}</button>
        </td>
      </tr>`).join('');

    renderPagination('admin-users-pagination', data.pagination, loadAdminUsers);
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="color:red;padding:10px">${err.message}</td></tr>`;
  }
}

async function changeRole(userId, role) {
  try {
    await API.put(`/admin/users/${userId}/role`, { role });
    showToast('Role updated');
    loadAdminUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleUser(userId) {
  try {
    await API.put(`/admin/users/${userId}/toggle`);
    showToast('User status updated');
    loadAdminUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAdminBookings(page = 1) {
  const container = document.getElementById('admin-bookings');
  if (!container) return;

  const status = document.getElementById('admin-booking-status')?.value || '';
  const params = new URLSearchParams({ page, limit: 20 });
  if (status) params.set('status', status);

  try {
    const data = await API.get(`/admin/bookings?${params}`);
    container.innerHTML = data.data.map(b => {
      const actions = b.status === 'pending'
        ? `<button onclick="updateStatus('${b._id}','confirmed')"
            style="padding:5px 10px;background:#dcfce7;color:#166534;border:none;border-radius:6px;cursor:pointer;font-size:12px;margin-right:6px">Confirm</button>
           <button onclick="updateStatus('${b._id}','cancelled')"
            style="padding:5px 10px;background:#fee2e2;color:#b91c1c;border:none;border-radius:6px;cursor:pointer;font-size:12px">Cancel</button>`
        : b.status === 'confirmed'
        ? `<button onclick="updateStatus('${b._id}','completed')"
            style="padding:5px 10px;background:#ede9fe;color:#6d28d9;border:none;border-radius:6px;cursor:pointer;font-size:12px;margin-right:6px">Complete</button>
           <button onclick="updateStatus('${b._id}','cancelled')"
            style="padding:5px 10px;background:#fee2e2;color:#b91c1c;border:none;border-radius:6px;cursor:pointer;font-size:12px">Cancel</button>`
        : '';

      return `
      <tr>
        <td style="padding:10px">${b.user?.name || 'N/A'}</td>
        <td style="padding:10px">${b.place?.name || 'N/A'}</td>
        <td style="padding:10px;text-transform:capitalize">${b.type}</td>
        <td style="padding:10px">${new Date(b.date).toLocaleDateString()}</td>
        <td style="padding:10px;text-transform:capitalize">${b.status}</td>
        <td style="padding:10px">${actions}</td>
      </tr>`;
    }).join('');

    renderPagination('admin-bookings-pagination', data.pagination, loadAdminBookings);
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="color:red;padding:10px">${err.message}</td></tr>`;
  }
}

async function adminDeleteReview(reviewId) {
  if (!confirm('Delete this review?')) return;
  try {
    await API.delete(`/admin/reviews/${reviewId}`);
    showToast('Review deleted');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
