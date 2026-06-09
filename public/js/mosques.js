document.addEventListener("DOMContentLoaded", () => {
  async function loadMosques() {
    const servicesWrapper = document.querySelector(".services-wrapper");
    if (!servicesWrapper) return;

    // Save the original hardcoded HTML
    const originalHTML = servicesWrapper.innerHTML;
    
    // Append a small loading indicator instead of replacing everything
    const loadingEl = document.createElement('p');
    loadingEl.className = 'loading-message';
    loadingEl.style.cssText = 'grid-column: 1/-1; text-align: center; color: #888;';
    loadingEl.textContent = t('mosque_loading', 'Loading dynamic mosques...');
    servicesWrapper.appendChild(loadingEl);

    try {
      const res = await API.get('/places?type=mosque&limit=50');
      const mosques = Array.isArray(res.data) ? res.data : [];

      // Remove loading indicator
      loadingEl.remove();

      if (mosques.length === 0) {
        // If no dynamic mosques, just leave the hardcoded ones intact!
        return;
      }

      // If we have dynamic mosques, append them to the existing ones


      mosques.forEach((mosque) => {
        const image = mosque.coverImage || '/photos/mosquepicture.jpg';
        const status = mosque.openingHours || t('mosque_open', 'Open');
        const directionsText = mosque.specialization || t('mosque_directions_not_listed', 'Directions not listed.');
        const lat = mosque.location?.lat;
        const lng = mosque.location?.lng;
        const mapsLink = lat && lng 
          ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
          : '#';

        const cardHTML = `
          <article class="card">
            <img src="${image}" alt="${mosque.name}">
            <div class="cards-content">
              <span class="status-tag">${status}</span>
              <h3>${mosque.name}</h3>
              <p>${mosque.description || ''}</p>
              <p class="directions-note" style="margin-top:8px; font-size:0.85rem; color:#6b7280; font-style:italic;">📍 ${directionsText}</p>
              ${lat && lng ? `<a href="${mapsLink}" target="_blank" rel="noreferrer" class="book-link" style="margin-top:12px; display:inline-block;">${t('mosque_open_route', 'Open Route')}</a>` : ''}
            </div>
          </article>
        `;
        servicesWrapper.insertAdjacentHTML('beforeend', cardHTML);
      });

    } catch (err) {
      console.error('Error loading mosques:', err);
      servicesWrapper.innerHTML = `<p class="error-message" style="grid-column: 1/-1; text-align: center; color: red;">${t('mosque_load_error', 'Error loading mosques: ')}${err.message}</p>`;
    }
  }

  loadMosques();
});