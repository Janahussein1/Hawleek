document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  // 1. SELECT ELEMENTS
  const tableBody = document.getElementById('reservation-table-body');
  const statTotal = document.getElementById('stat-total');
  const statPending = document.getElementById('stat-pending');
  const statCancelled = document.getElementById('stat-cancelled');
  const addForm = document.getElementById('addReservationForm');

  // 2. DATA INITIALIZATION
  let reservations = [];

// 3. TOAST NOTIFICATION FUNCTION
function showToast(message, type = 'success') {
const container = document.getElementById('toast-container');
if (!container) return;

const toast = document.createElement('div');
toast.className = `toast toast-${type}`;
toast.innerText = message;

container.appendChild(toast);

// Auto-remove after 3 seconds
setTimeout(() => {
toast.style.opacity = '0';
setTimeout(() => toast.remove(), 500);
}, 3000);
}

// 4. CORE FUNCTIONS
function updateStats() {
  statTotal.innerText = reservations.length;
  statPending.innerText = reservations.filter(r => (r.status || '').toLowerCase() === 'pending').length;
  statCancelled.innerText = reservations.filter(r => (r.status || '').toLowerCase() === 'cancelled').length;
}

function saveData() {
  updateStats();
}

function renderTable() {
tableBody.innerHTML = '';

reservations.forEach((res, index) => {
const row = document.createElement('tr');
row.className = 'res-row';
row.setAttribute('data-status', res.status);

const customerName = res.place?.name || res.name || 'Unknown';
const guests = res.partySize || res.guests || 1;
const dateTime = res.date ? new Date(res.date).toLocaleString() : (res.dateTime ? res.dateTime.replace('T', ' ') : res.time || 'N/A');
const statusText = res.status ? `${res.status.charAt(0).toUpperCase()}${res.status.slice(1)}` : 'Pending';
const statusColor = statusText === 'Confirmed' ? '#27ae60' : (statusText === 'Cancelled' ? '#e74c3c' : '#f39c12');

row.innerHTML = `
<td>${customerName}</td>
<td>${guests}</td>
<td>${dateTime}</td>
<td style="color: ${statusColor}; font-weight: bold;">${statusText}</td>
<td>
<button class="btn-confirm" data-index="${index}">Confirm</button>
<button class="btn-cancel" data-index="${index}">Cancel</button>
</td>
`;
tableBody.appendChild(row);
});
updateStats();
}

// 5. EVENT LISTENERS

// Add New Reservation
addForm.addEventListener('submit', (e) => {
e.preventDefault();

const name = document.getElementById('resName').value.trim();
const guests = parseInt(document.getElementById('resGuests').value);
const dateStr = document.getElementById('resDateTime').value;
const inputDate = new Date(dateStr);
const now = new Date();

// VALIDATION 1: Letters only
if (!/^[A-Za-z\s]+$/.test(name)) {
showToast("Error: Name must be letters only!", "error");
return;
}

// VALIDATION 2: No negative or zero
if (guests <= 0) {
showToast("Error: Guests must be at least 1!", "error");
return;
}

// VALIDATION 3: No past dates
if (inputDate < now) {
showToast("Error: You cannot book a date in the past!", "error");
return;
}

// Add to array
reservations.push({
  name: name,
  guests: guests,
  dateTime: dateStr,
  status: 'pending'
});

saveData();
renderTable();
showToast("Reservation successfully added!");
addForm.reset();
});

// Handle Confirm/Cancel (Using Event Delegation)
tableBody.addEventListener('click', (e) => {
const index = e.target.dataset.index;
if (index === undefined) return;

if (e.target.classList.contains('btn-confirm')) {
  reservations[index].status = 'confirmed';
  showToast("Booking Confirmed!");
} else if (e.target.classList.contains('btn-cancel')) {
  reservations[index].status = 'cancelled';
  showToast("Booking Cancelled", "error");
}

saveData();
renderTable();
});

async function loadBookings() {
  try {
    const response = await API.get('/users/bookings?limit=100');
    reservations = Array.isArray(response.data) ? response.data : [];
    renderTable();
  } catch (err) {
    showToast(`Unable to load bookings: ${err.message}`, 'error');
  }
}

// 6. INITIAL RUN
loadBookings();
});
