let clinicMap = {};
let selectedClinic = null;

function escapeHtml(text) {
  return String(text || '').replace(/[&<>"]+/g, (tag) => {
    const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
    return chars[tag] || tag;
  });
}

async function loadClinics() {
  const container = document.getElementById('clinic-list');
  if (!container) return;

  container.innerHTML = '<p class="loading-message">Loading clinics &hellip;</p>';

  try {
    const data = await API.get('/places?type=clinic&limit=50');
    const clinics = Array.isArray(data.data) ? data.data : [];

    if (clinics.length === 0) {
      container.innerHTML = '<p class="notice">No clinics are available at this time. Please check back later.</p>';
      return;
    }

    clinicMap = {};
    container.innerHTML = clinics.map((place) => {
      clinicMap[place._id] = place;
      const image = place.coverImage || '/photos/generalclinic.jpg';
      const spec = place.specialization || 'General Medicine';
      const hours = place.openingHours || 'Hours not listed';
      const shortDesc = place.description || 'Book an appointment with our qualified medical professionals.';
      const rating = place.averageRating ? `⭐ ${place.averageRating.toFixed(1)}` : 'New';

      return `
        <article class="clinic-card">
          <img src="${image}" alt="${escapeHtml(place.name)}">
          <div class="clinic-card-body">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div>
                <h3>${escapeHtml(place.name)}</h3>
                <p class="rating-badge" style="margin:0;font-size:0.9rem;color:#666">${rating}</p>
              </div>
            </div>
            <p>${escapeHtml(shortDesc)}</p>
            <div class="clinic-meta">
              <span>📍 ${escapeHtml(place.address || place.neighborhood || 'Nearby location')}</span>
              <span>🏥 ${escapeHtml(spec)}</span>
              <span>🕐 ${escapeHtml(hours)}</span>
              <span>📞 ${escapeHtml(place.phone || 'Contact clinic')}</span>
            </div>
            <button class="appointment-btn" type="button" data-id="${place._id}">Book Appointment →</button>
          </div>
        </article>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p class="error-message">Could not load clinics. ${escapeHtml(err.message)}</p>`;
  }
}

function openAppointmentForm(place) {
  selectedClinic = place;
  const user = getUser();
  const defaultEmail = user?.email || '';
  const defaultName = user?.name || '';

  const panel = document.getElementById('appointment-panel');
  if (!panel) return;

  panel.innerHTML = `
    <section class="appointment-card">
      <div class="appointment-header">
        <div>
          <p class="eyebrow">🏥 Book an Appointment</p>
          <h2>${escapeHtml(place.name)}</h2>
          <p class="subtitle">${escapeHtml(place.specialization || 'Medical Services')} · ${escapeHtml(place.address)}</p>
        </div>
        <button class="close-button" type="button" aria-label="Close appointment form">✕</button>
      </div>
      <form id="clinic-appointment-form">
        <div class="form-grid">
          <label>
            Your Name *
            <input type="text" id="appointment-name" required value="${escapeHtml(defaultName)}" placeholder="Enter your name">
          </label>
          <label>
            Your Email *
            <input type="email" id="appointment-email" required value="${escapeHtml(defaultEmail)}" placeholder="your@email.com">
          </label>
          <label>
            Date *
            <input type="date" id="appointment-date" required min="${new Date().toISOString().split('T')[0]}">
          </label>
          <label>
            Preferred Time *
            <input type="time" id="appointment-time" required>
          </label>
          <label>
            Phone Number *
            <input type="tel" id="appointment-phone" required placeholder="+20 1XX XXX XXXX">
          </label>
        </div>
        <label>
          Reason for Visit *
          <textarea id="appointment-reason" rows="4" required placeholder="Describe your symptoms or reason for visit..."></textarea>
        </label>
        <label>
          Additional Notes (optional)
          <textarea id="appointment-notes" rows="3" placeholder="Any medical history or allergies we should know about..."></textarea>
        </label>
        <div class="form-actions">
          <button type="submit" class="primary-btn" id="submit-btn">Confirm Appointment</button>
          <button type="button" class="secondary-btn" id="cancel-appointment">Cancel</button>
        </div>
      </form>
      <p class="help-text">✓ You will receive a confirmation email with the clinic name, date, and time</p>
    </section>`;

  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeAppointmentForm() {
  const panel = document.getElementById('appointment-panel');
  if (panel) panel.innerHTML = '';
  selectedClinic = null;
}

async function handleAppointmentSubmit(event) {
  if (!event.target.matches('#clinic-appointment-form')) return;
  event.preventDefault();

  if (!selectedClinic) {
    showToast('Please select a clinic', 'error');
    return;
  }

  if (!getToken()) {
    // Allow guest appointment bookings — continue and post to guest endpoint
  }

  const name = document.getElementById('appointment-name')?.value.trim();
  const email = document.getElementById('appointment-email')?.value.trim();
  const date = document.getElementById('appointment-date')?.value;
  const time = document.getElementById('appointment-time')?.value;
  const phone = document.getElementById('appointment-phone')?.value.trim();
  const reason = document.getElementById('appointment-reason')?.value.trim();
  const notes = document.getElementById('appointment-notes')?.value.trim();
  const submitButton = event.target.querySelector('#submit-btn');

  // Validation
  if (!name) {
    showToast('Please enter your name', 'error');
    return;
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  if (!phone) {
    showToast('Please enter your phone number', 'error');
    return;
  }

  if (!date || !time) {
    showToast('Please select a date and time', 'error');
    return;
  }

  if (!reason) {
    showToast('Please describe the reason for your visit', 'error');
    return;
  }

  showSpinner(submitButton);

  try {
    const bookingData = {
      placeId: selectedClinic._id,
      type: 'appointment',
      date,
      time,
      partySize: 1,
      notes: (reason ? `Reason: ${reason}. ` : '') + (notes || ''),
      contactEmail: email,
    };

    console.log('🏥 Submitting appointment:', bookingData);

    const response = getToken() ? await API.post('/bookings', bookingData) : await API.post('/bookings/guest', { ...bookingData, name });

    console.log('✅ Appointment created:', response);

    showToast(`🎉 Appointment confirmed at ${selectedClinic.name}!\n📧 Check ${email} for confirmation`, 'success');
    
    setTimeout(() => {
      closeAppointmentForm();
      event.target.reset();
    }, 1000);
  } catch (err) {
    console.error('❌ Appointment error:', err);
    showToast(`Booking failed: ${err.message}`, 'error');
  } finally {
    hideSpinner(submitButton);
  }
}

function handleClinicCardClick(event) {
  const button = event.target.closest('.appointment-btn');
  if (!button) return;
  const placeId = button.dataset.id;
  const place = clinicMap[placeId];
  if (place) openAppointmentForm(place);
}

function handlePanelClick(event) {
  if (event.target.id === 'cancel-appointment' || event.target.closest('.close-button')) {
    closeAppointmentForm();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof updateNav === 'function') updateNav();
  loadClinics();
  document.getElementById('clinic-list')?.addEventListener('click', handleClinicCardClick);
  document.getElementById('appointment-panel')?.addEventListener('click', handlePanelClick);
  document.body.addEventListener('submit', handleAppointmentSubmit);
});
