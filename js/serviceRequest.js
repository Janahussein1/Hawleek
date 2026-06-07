document.addEventListener('DOMContentLoaded', () => {
  if (typeof updateNav === 'function') updateNav();

  // Set min date to today
  const dateInput = document.getElementById('sr-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  // Pre-fill user info if logged in
  const user = getUser();
  if (user) {
    const nameInput = document.getElementById('sr-name');
    const emailInput = document.getElementById('sr-email');
    if (nameInput && user.name) nameInput.value = user.name;
    if (emailInput && user.email) emailInput.value = user.email;
  }

  const form = document.getElementById('service-request-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('sr-name')?.value.trim();
    const email = document.getElementById('sr-email')?.value.trim();
    const phone = document.getElementById('sr-phone')?.value.trim();
    const serviceType = document.querySelector('input[name="sr-service-type"]:checked')?.value;
    const date = document.getElementById('sr-date')?.value;
    const timeSlot = document.querySelector('input[name="sr-time-slot"]:checked')?.value || 'morning';
    const address = document.getElementById('sr-address')?.value.trim();
    const description = document.getElementById('sr-description')?.value.trim();
    const notes = document.getElementById('sr-notes')?.value.trim();
    const submitBtn = document.getElementById('sr-submit-btn');

    // Validation
    if (!name) { showToast('Please enter your name', 'error'); return; }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { showToast('Please enter a valid email', 'error'); return; }
    if (!phone) { showToast('Please enter your phone number', 'error'); return; }
    if (!serviceType) { showToast('Please select a service type', 'error'); return; }
    if (!date) { showToast('Please select a preferred date', 'error'); return; }
    if (!address) { showToast('Please enter your address', 'error'); return; }
    if (!description) { showToast('Please describe the issue', 'error'); return; }

    const serviceLabels = {
      'electrical': '⚡ Electrical',
      'plumbing': '🔧 Plumbing',
      'ac-repair': '❄️ AC Repair',
      'painting': '🎨 Painting',
      'carpentry': '🪚 Carpentry',
      'general': '🏠 General Maintenance',
      'emergency': '🚨 Emergency Repair',
    };

    const timeLabels = {
      'morning': 'Morning (8 AM - 12 PM)',
      'afternoon': 'Afternoon (12 PM - 5 PM)',
      'evening': 'Evening (5 PM - 9 PM)',
      'emergency': 'ASAP / Emergency',
    };

    // Build a structured message for the contact endpoint
    const message = [
      `SERVICE REQUEST — Sayed Electric & Plumbing`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Service Type: ${serviceLabels[serviceType] || serviceType}`,
      `Preferred Date: ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Preferred Time: ${timeLabels[timeSlot] || timeSlot}`,
      `Phone: ${phone}`,
      `Address: ${address}`,
      ``,
      `Issue Description:`,
      description,
      notes ? `\nAdditional Notes:\n${notes}` : '',
    ].filter(Boolean).join('\n');

    showSpinner(submitBtn);

    try {
      await API.post('/contact', { name, email, message });
      showToast('🎉 Service request submitted! Check your email for confirmation.', 'success');
      form.reset();
    } catch (err) {
      console.error('Service request error:', err);
      showToast(`Failed to submit: ${err.message}`, 'error');
    } finally {
      hideSpinner(submitBtn);
    }
  });
});
