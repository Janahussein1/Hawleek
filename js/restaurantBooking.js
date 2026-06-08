let restaurantMap = {};
let selectedRestaurant = null;

function escapeHtml(text) {
  return String(text || '').replace(/[&<>"]+/g, (tag) => {
    const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
    return chars[tag] || tag;
  });
}

async function loadRestaurants() {
  const container = document.getElementById('restaurant-list');
  if (!container) return;

  container.innerHTML = '<p class="loading-message">' + t('rest_loading', 'Loading local restaurants &hellip;') + '</p>';

  try {
    const data = await API.get('/places?type=restaurant&limit=50');
    const restaurants = Array.isArray(data.data) ? data.data : [];

    if (restaurants.length === 0) {
      container.innerHTML = '<p class="notice">' + t('rest_no_rests', 'No restaurant reservations are available at this time. Please check back later.') + '</p>';
      return;
    }

    restaurantMap = {};
    container.innerHTML = restaurants.map((place) => {
      restaurantMap[place._id] = place;
      const image = place.coverImage || '/photos/pizzaria.jpg';
      const cuisine = place.cuisine || t('rest_local_cuisine', 'Local cuisine');
      const hours = place.openingHours || t('clinic_no_hours', 'Hours not listed');
      const shortDesc = place.description || t('rest_default_desc', 'Reserve a table with an email confirmation from the restaurant.');
      const rating = place.averageRating ? `⭐ ${place.averageRating.toFixed(1)}` : t('clinic_new', 'New');

      return `
        <article class="restaurant-card">
          <img src="${image}" alt="${escapeHtml(place.name)}">
          <div class="restaurant-card-body">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div>
                <h3>${escapeHtml(place.name)}</h3>
                <p class="rating-badge" style="margin:0;font-size:0.9rem;color:#666">${rating}</p>
              </div>
            </div>
            <p>${escapeHtml(shortDesc)}</p>
            <div class="restaurant-meta">
              <span>📍 ${escapeHtml(place.address || place.neighborhood || t('clinic_nearby', 'Nearby location'))}</span>
              <span>🍽️ ${escapeHtml(cuisine)}</span>
              <span>🕐 ${escapeHtml(hours)}</span>
            </div>
            <button class="reserve-btn" type="button" data-id="${place._id}">${t('rest_reserve_btn', 'Reserve a Table →')}</button>
          </div>
        </article>`;
    }).join('');

    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('placeId');
    if (placeId && restaurantMap[placeId]) {
      setTimeout(() => {
        openReservationForm(restaurantMap[placeId]);
      }, 100);
    }
  } catch (err) {
    container.innerHTML = `<p class="error-message">${t('rest_load_error', 'Could not load restaurants. ')} ${escapeHtml(err.message)}</p>`;
  }
}

function openReservationForm(place) {
  selectedRestaurant = place;
  const user = getUser();
  const defaultEmail = user?.email || '';
  const defaultName = user?.name || '';

  const panel = document.getElementById('reservation-panel');
  if (!panel) return;

  panel.innerHTML = `
    <section class="reservation-card">
      <div class="reservation-header">
        <div>
          <p class="eyebrow">${t('rest_form_eyebrow', '🍽️ Reserve a Table')}</p>
          <h2>${escapeHtml(place.name)}</h2>
          <p class="subtitle">${escapeHtml(place.address)}</p>
        </div>
        <button class="close-button" type="button" aria-label="Close reservation form">✕</button>
      </div>
      <form id="restaurant-reservation-form">
        <div class="form-grid">
          <label>
            ${t('clinic_form_name', 'Your Name *')}
            <input type="text" id="reservation-name" required value="${escapeHtml(defaultName)}" placeholder="${t('clinic_form_name_placeholder', 'Enter your name')}">
          </label>
          <label>
            ${t('clinic_form_email', 'Your Email *')}
            <input type="email" id="reservation-email" required value="${escapeHtml(defaultEmail)}" placeholder="your@email.com">
          </label>
          <label>
            ${t('clinic_form_date', 'Date *')}
            <input type="date" id="reservation-date" required min="${new Date().toISOString().split('T')[0]}">
          </label>
          <label>
            ${t('rest_form_time', 'Time *')}
            <input type="time" id="reservation-time" required>
          </label>
          <label>
            ${t('rest_form_guests', 'Number of Guests *')}
            <input type="number" id="reservation-party" required min="1" value="2">
          </label>
          <label>
            ${t('rest_form_phone', 'Phone Number')}
            <input type="tel" id="reservation-phone" placeholder="+20 1XX XXX XXXX">
          </label>
        </div>
        <label>
          ${t('rest_form_requests', 'Special Requests (optional)')}
          <textarea id="reservation-notes" rows="4" placeholder="${t('rest_form_requests_placeholder', 'E.g. Window seat, vegetarian options needed, special occasion...')}"></textarea>
        </label>
        <div class="form-actions">
          <button type="submit" class="primary-btn" id="submit-btn">${t('rest_form_submit', 'Complete Reservation')}</button>
          <button type="button" class="secondary-btn" id="cancel-reservation">${t('clinic_form_cancel', 'Cancel')}</button>
        </div>
      </form>
      <p class="help-text">${t('rest_form_help', '✓ You will receive a confirmation email with the restaurant name, date, and time')}</p>
    </section>`;

  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeReservationForm() {
  const panel = document.getElementById('reservation-panel');
  if (panel) panel.innerHTML = '';
  selectedRestaurant = null;
}

async function handleReservationSubmit(event) {
  if (!event.target.matches('#restaurant-reservation-form')) return;
  event.preventDefault();

  if (!selectedRestaurant) {
    showToast(t('rest_toast_select', 'Please select a restaurant'), 'error');
    return;
  }

  if (!getToken()) {
    // Allow guest booking: proceed and post to guest booking endpoint
    // showToast('You are booking as a guest. A confirmation email will be sent.', 'info');
    // continue
  }

  const name = document.getElementById('reservation-name')?.value.trim();
  const email = document.getElementById('reservation-email')?.value.trim();
  const date = document.getElementById('reservation-date')?.value;
  const time = document.getElementById('reservation-time')?.value;
  const partySize = parseInt(document.getElementById('reservation-party')?.value, 10) || 1;
  const phone = document.getElementById('reservation-phone')?.value.trim();
  const notes = document.getElementById('reservation-notes')?.value.trim();
  const submitButton = event.target.querySelector('#submit-btn');

  // Validation
  if (!name) {
    showToast(t('clinic_toast_name', 'Please enter your name'), 'error');
    return;
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    showToast(t('clinic_toast_email', 'Please enter a valid email address'), 'error');
    return;
  }

  if (!date || !time) {
    showToast(t('clinic_toast_datetime', 'Please select a date and time'), 'error');
    return;
  }

  if (partySize < 1) {
    showToast(t('rest_toast_guests', 'Please enter at least 1 guest'), 'error');
    return;
  }

  showSpinner(submitButton);

  try {
    const bookingData = {
      placeId: selectedRestaurant._id,
      type: 'table',
      date,
      time,
      partySize,
      notes: notes || undefined,
      contactEmail: email,
    };

    console.log('📅 Submitting booking:', bookingData);

    const response = getToken() ? await API.post('/bookings', bookingData) : await API.post('/bookings/guest', { ...bookingData, name: name });

    console.log('✅ Booking created:', response);

    showToast(`${t('rest_toast_confirmed', '🎉 Reservation confirmed at ')}${selectedRestaurant.name}${t('clinic_toast_check_email', '!\\n📧 Check ')}${email}${t('clinic_toast_for_confirmation', ' for confirmation')}`, 'success');
    
    setTimeout(() => {
      closeReservationForm();
      event.target.reset();
    }, 1000);
  } catch (err) {
    console.error('❌ Booking error:', err);
    showToast(`${t('clinic_toast_failed', 'Booking failed: ')}${err.message}`, 'error');
  } finally {
    hideSpinner(submitButton);
  }
}

function handleRestaurantCardClick(event) {
  const button = event.target.closest('.reserve-btn');
  if (!button) return;
  const placeId = button.dataset.id;
  const place = restaurantMap[placeId];
  if (place) openReservationForm(place);
}

function handlePanelClick(event) {
  if (event.target.id === 'cancel-reservation' || event.target.closest('.close-button')) {
    closeReservationForm();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof updateNav === 'function') updateNav();
  loadRestaurants();
  document.getElementById('restaurant-list')?.addEventListener('click', handleRestaurantCardClick);
  document.getElementById('reservation-panel')?.addEventListener('click', handlePanelClick);
  document.body.addEventListener('submit', handleReservationSubmit);
});
