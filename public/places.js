
// Include api.js BEFORE this file in your HTML

let currentPage = 1;
let currentFilters = {};

document.addEventListener('DOMContentLoaded', () => {
  loadNeighborhoods();
  loadPlaces();
  loadWeather();

  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentPage = 1;
      currentFilters.search      = document.getElementById('search-input')?.value.trim() || '';
      currentFilters.type        = document.getElementById('type-filter')?.value || '';
      currentFilters.neighborhood = document.getElementById('neighborhood-filter')?.value || '';
      loadPlaces();
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sort = sortSelect.value;
      currentPage = 1;
      loadPlaces();
    });
  }
});

async function loadPlaces(page = 1) {
  currentPage = page;
  const container = document.getElementById('places-container');
  const countEl   = document.getElementById('places-count');
  if (!container) return;

  container.innerHTML = '<p style="text-align:center;color:#888">Loading places...</p>';

  const params = new URLSearchParams({
    page,
    limit: 12,
    ...currentFilters,
  });


  for (const [k, v] of params.entries()) {
    if (!v) params.delete(k);
  }

  try {
    const data = await API.get(`/places?${params.toString()}`);
    const places = data.data;

    if (countEl) countEl.textContent = `${data.pagination.total} places found`;

    if (places.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px;color:#888">
          <h3>No places found</h3>
          <p>Try adjusting your search or filters</p>
        </div>`;
      return;
    }

    container.innerHTML = places.map(renderPlaceCard).join('');

    renderPagination('pagination-container', data.pagination, loadPlaces);
  } catch (err) {
    container.innerHTML = `<p style="color:red;text-align:center">${err.message}</p>`;
  }
}

function renderPlaceCard(place) {
  const stars = '★'.repeat(Math.round(place.averageRating)) + '☆'.repeat(5 - Math.round(place.averageRating));
  const verified = place.isVerified ? '<span style="color:#22c55e;font-size:12px">✓ Verified</span>' : '';
  const img = place.coverImage
    ? `http://localhost:5000${place.coverImage}`
    : 'https://via.placeholder.com/300x180?text=No+Image';

  return `
    <div class="place-card" onclick="window.location.href='/Homepage /place-detail.html?id=${place._id}'"
      style="cursor:pointer;border:1px solid #eee;border-radius:12px;overflow:hidden;
             transition:transform 0.2s,box-shadow 0.2s;"
      onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'"
      onmouseout="this.style.transform='';this.style.boxShadow=''">
      <img src="${img}" alt="${place.name}"
        style="width:100%;height:180px;object-fit:cover;"
        onerror="this.src='https://via.placeholder.com/300x180?text=${encodeURIComponent(place.name)}'">
      <div style="padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
          <h3 style="margin:0;font-size:16px">${place.name}</h3>
          ${verified}
        </div>
        <p style="margin:4px 0 8px;font-size:13px;color:#888;text-transform:capitalize">
          ${place.type} · ${place.neighborhood}
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#555;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
          ${place.description || ''}
        </p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="color:#f59e0b;font-size:15px">${stars}</span>
          <span style="font-size:12px;color:#888">${place.reviewCount} reviews</span>
        </div>
        ${place.openingHours ? `<p style="margin:8px 0 0;font-size:12px;color:#888">⏰ ${place.openingHours}</p>` : ''}
      </div>
    </div>`;
}


async function loadNeighborhoods() {
  const select = document.getElementById('neighborhood-filter');
  if (!select) return;

  try {
    const data = await API.get('/places/neighborhoods/list');
    data.data.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n;
      select.appendChild(opt);
    });
  } catch (err) {
    console.warn('Could not load neighborhoods:', err.message);
  }
}

async function loadWeather() {
  const weatherEl = document.getElementById('weather-widget');
  if (!weatherEl) return;

  try {
    const data = await API.get('/weather');
    const w = data.data;
    weatherEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;
        background:#e0f2fe;border-radius:10px;font-size:14px">
        <img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.description}"
          style="width:40px;height:40px" onerror="this.style.display='none'">
        <div>
          <strong>${w.city}</strong> · ${w.temperature}°C
          <br><span style="color:#555;text-transform:capitalize">${w.description}</span>
          · 💧 ${w.humidity}%
          ${w.isMock ? '<small style="color:#f59e0b"> (demo)</small>' : ''}
        </div>
      </div>`;
  } catch (err) {
    console.warn('Weather unavailable:', err.message);
  }
}

async function loadPlaceDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const container = document.getElementById('place-detail');
  if (container) container.innerHTML = 'Loading...';

  try {
    const [placeData, reviewData] = await Promise.all([
      API.get(`/places/${id}`),
      API.get(`/reviews/place/${id}`),
    ]);

    const p = placeData.data;
    const reviews = reviewData.data;

    const img = p.coverImage
      ? `http://localhost:5000${p.coverImage}`
      : 'https://via.placeholder.com/800x300?text=' + encodeURIComponent(p.name);

    if (container) {
      container.innerHTML = `
        <img src="${img}" alt="${p.name}"
          style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:20px"
          onerror="this.src='https://via.placeholder.com/800x300'">
        <h1 style="margin:0 0 4px">${p.name} ${p.isVerified ? '✓' : ''}</h1>
        <p style="color:#888;text-transform:capitalize">${p.type} · ${p.neighborhood}</p>
        <p>${p.description || ''}</p>
        <p>📍 ${p.address}</p>
        ${p.phone ? `<p>📞 ${p.phone}</p>` : ''}
        ${p.openingHours ? `<p>⏰ ${p.openingHours}</p>` : ''}
        <p>⭐ ${p.averageRating}/5 (${p.reviewCount} reviews)</p>
        ${p.type === 'station' ? renderRoutes(p.routes, id) : renderBookingForm(p)}
        <hr style="margin:24px 0">
        <h2>Reviews</h2>
        <div id="reviews-list">
          ${reviews.length === 0
            ? '<p style="color:#888">No reviews yet. Be the first!</p>'
            : reviews.map(renderReview).join('')}
        </div>
        ${getToken() ? renderReviewForm(id) : '<p><a href="/dashboard/login">Login to add a review</a></p>'}
      `;
    }

    setupBookingForm(p, id);
    setupReviewForm(id);
    if (p.type === 'station') setupSeatBooking(p, id);

  } catch (err) {
    if (container) container.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}


function renderRoutes(routes, placeId) {
  if (!routes || routes.length === 0) return '';
  return `
    <h2>Available Routes</h2>
    <div style="display:grid;gap:12px">
      ${routes.map((r, i) => `
        <div style="border:1px solid #eee;border-radius:10px;padding:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div>
            <strong>→ ${r.destination}</strong>
            <br><span style="color:#888;font-size:13px">🕐 ${r.departureTime} · EGP ${r.price}/seat</span>
          </div>
          <div style="text-align:right">
            <span style="font-size:13px;color:${r.availableSeats > 0 ? '#22c55e' : '#ef4444'}">
              ${r.availableSeats}/${r.totalSeats} seats
            </span>
            <br>
            ${r.availableSeats > 0
              ? `<button onclick="openSeatBooking(${i}, '${r.destination}', ${r.price}, ${r.availableSeats}, '${placeId}')"
                  style="margin-top:8px;padding:8px 16px;background:#0f6e56;color:#fff;border:none;border-radius:8px;cursor:pointer">
                  Book Seat</button>`
              : '<span style="color:#ef4444;font-size:13px">Fully booked</span>'}
          </div>
        </div>`).join('')}
    </div>
    <div id="seat-booking-form" style="display:none;margin-top:20px;padding:20px;border:1px solid #0f6e56;border-radius:12px"></div>`;
}


function renderBookingForm(place) {
  const type = place.type === 'clinic' ? 'appointment' : 'table';
  return `
    <h2>Make a ${type === 'appointment' ? 'Appointment' : 'Reservation'}</h2>
    <form id="booking-form" style="display:grid;gap:12px;max-width:400px">
      <input type="date" id="booking-date" required
        min="${new Date().toISOString().split('T')[0]}"
        style="padding:10px;border:1px solid #ddd;border-radius:8px">
      <input type="time" id="booking-time" required
        style="padding:10px;border:1px solid #ddd;border-radius:8px">
      ${type === 'table' ? `
        <input type="number" id="booking-party" placeholder="Party size" min="1" value="2"
          style="padding:10px;border:1px solid #ddd;border-radius:8px">` : ''}
      <textarea id="booking-notes" placeholder="Special requests (optional)" rows="3"
        style="padding:10px;border:1px solid #ddd;border-radius:8px;resize:vertical"></textarea>
      ${getToken()
        ? `<button type="submit" id="booking-btn"
            style="padding:12px;background:#0f6e56;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:15px">
            Confirm ${type === 'appointment' ? 'Appointment' : 'Reservation'}</button>`
        : `<a href="/dashboard/login"
            style="display:block;padding:12px;background:#0f6e56;color:#fff;text-decoration:none;
            border-radius:8px;text-align:center">Login to Book</a>`}
    </form>`;
}

function setupBookingForm(place, placeId) {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!getToken()) { window.location.href = '/dashboard/login'; return; }

    const btn  = document.getElementById('booking-btn');
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;

    if (!date || !time) { showToast('Please select date and time', 'error'); return; }

    showSpinner(btn);
    try {
      await API.post('/bookings', {
        placeId,
        type: place.type === 'clinic' ? 'appointment' : 'table',
        date,
        time,
        partySize: parseInt(document.getElementById('booking-party')?.value) || 1,
        notes: document.getElementById('booking-notes')?.value || '',
      });
      showToast('Booking confirmed! 🎉');
      form.reset();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      hideSpinner(btn);
    }
  });
}


function openSeatBooking(routeIndex, destination, price, available, placeId) {
  const panel = document.getElementById('seat-booking-form');
  if (!panel) return;

  panel.style.display = 'block';
  panel.innerHTML = `
    <h3>Book Seat → ${destination}</h3>
    <p>EGP ${price}/seat · ${available} available</p>
    <label>Number of seats:
      <input type="number" id="seats-count" min="1" max="${available}" value="1"
        style="padding:8px;border:1px solid #ddd;border-radius:6px;margin-left:8px;width:60px">
    </label>
    <br><br>
    <label>Date: <input type="date" id="seat-date" min="${new Date().toISOString().split('T')[0]}"
      style="padding:8px;border:1px solid #ddd;border-radius:6px;margin-left:8px"></label>
    <br><br>
    <p id="seat-total" style="font-weight:bold">Total: EGP ${price}</p>
    <button id="seat-book-btn" onclick="confirmSeatBooking('${placeId}', ${routeIndex}, ${price})"
      style="padding:10px 24px;background:#0f6e56;color:#fff;border:none;border-radius:8px;cursor:pointer">
      Confirm Booking</button>
    <button onclick="document.getElementById('seat-booking-form').style.display='none'"
      style="margin-left:10px;padding:10px 16px;background:#eee;border:none;border-radius:8px;cursor:pointer">Cancel</button>`;

  document.getElementById('seats-count').addEventListener('input', function () {
    document.getElementById('seat-total').textContent = `Total: EGP ${this.value * price}`;
  });
}

function setupSeatBooking() {} 

async function confirmSeatBooking(placeId, routeIndex, price) {
  if (!getToken()) { window.location.href = '/dashboard/login'; return; }

  const seats = parseInt(document.getElementById('seats-count')?.value) || 1;
  const date  = document.getElementById('seat-date')?.value;
  if (!date) { showToast('Please select a departure date', 'error'); return; }

  const btn = document.getElementById('seat-book-btn');
  showSpinner(btn);

  try {
    await API.post('/bookings', {
      placeId,
      type: 'seat',
      date,
      time: '',
      seatsBooked: seats,
      routeIndex,
      totalPrice: seats * price,
    });
    showToast(`${seats} seat(s) booked successfully! 🚌`);
    document.getElementById('seat-booking-form').style.display = 'none';
    loadPlaceDetail(); 
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    hideSpinner(btn);
  }
}

function renderReview(r) {
  const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
  return `
    <div style="border-bottom:1px solid #eee;padding:16px 0">
      <strong>${r.user?.name || 'User'}</strong>
      <span style="color:#f59e0b;margin-left:8px">${stars}</span>
      <span style="color:#888;font-size:12px;margin-left:8px">${new Date(r.createdAt).toLocaleDateString()}</span>
      ${r.comment ? `<p style="margin:8px 0 0;color:#444">${r.comment}</p>` : ''}
    </div>`;
}

function renderReviewForm(placeId) {
  return `
    <h3>Leave a Review</h3>
    <form id="review-form" style="display:grid;gap:10px;max-width:400px">
      <div>
        <label>Rating: </label>
        ${[1,2,3,4,5].map(n =>
          `<input type="radio" name="rating" value="${n}" id="star${n}">
           <label for="star${n}" style="cursor:pointer">★</label>`
        ).join('')}
      </div>
      <textarea id="review-comment" placeholder="Share your experience..." rows="3"
        style="padding:10px;border:1px solid #ddd;border-radius:8px;resize:vertical"></textarea>
      <button type="submit"
        style="padding:10px;background:#f59e0b;color:#fff;border:none;border-radius:8px;cursor:pointer">
        Submit Review</button>
    </form>`;
}

function setupReviewForm(placeId) {
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rating  = form.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById('review-comment').value.trim();

    if (!rating) { showToast('Please select a rating', 'error'); return; }

    const btn = form.querySelector('button[type="submit"]');
    showSpinner(btn);

    try {
      await API.post(`/reviews/place/${placeId}`, { rating: parseInt(rating), comment });
      showToast('Review submitted! ⭐');
      form.reset();
     
      const rl = document.getElementById('reviews-list');
      if (rl) {
        const data = await API.get(`/reviews/place/${placeId}`);
        rl.innerHTML = data.data.map(renderReview).join('') || '<p>No reviews yet.</p>';
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      hideSpinner(btn);
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('place-detail')) {
    loadPlaceDetail();
  }
});
