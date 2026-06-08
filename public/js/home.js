document.addEventListener("DOMContentLoaded", () => {
    
    const localBusinesses = [
        {
            name: t('local_pizza_name', "Neighborhood Pizzeria"),
            description: t('local_pizza_desc', "Authentic wood-fired pizza right around the corner."),
            image: "/photos/restaurant.jpg",
            link: "/booking",
            linkText: t('home_book_table', "Book a Table")
        },
        {
            name: t('local_service_name', "Sayed Electric & Plumbing"),
            description: t('local_service_desc', "Reliable home maintenance and emergency repairs."),
            image: "/photos/technician.jpg",
            link: "/services/request",
            linkText: t('home_request_service', "Request Service")
        },
        {
            name: t('local_transport_name', "Local Transport Hub"),
            description: t('local_transport_desc', "Track microbuses and find the nearest stations in real-time."),
            image: "/photos/transportation.jpg",
            link: "/transport",
            linkText: t('home_view_transport', "View Schedule")
        }
    ];

    const servicesWrapper = document.querySelector(".services-wrapper") || document.getElementById('search-results');

    // Render initial featured items (simple fallback)
    if (servicesWrapper) {
        servicesWrapper.innerHTML = localBusinesses.map((business) => `
            <article class="card">
                <img src="${business.image}" alt="${business.name}">
                <div class="card-content">
                    <h3>${business.name}</h3>
                    <p>${business.description}</p>
                    <a href="${business.link}" class="book-link">${business.linkText}</a>
                </div>
            </article>
        `).join('');
    }

    // Search handling
    const form = document.getElementById('searchform');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const q = document.getElementById('searchQuery')?.value.trim();
        const cat = document.getElementById('category')?.value;
        const target = document.getElementById('search-results');
        if (!target) return;
        target.innerHTML = '<p class="loading-message">' + t('search_loading', 'Searching &hellip;') + '</p>';
        try {
            let url = `/places?limit=24`;
            if (q) url += `&search=${encodeURIComponent(q)}`;
            if (cat && cat !== 'all') url += `&type=${encodeURIComponent(cat)}`;
            const res = await API.get(url);
            const results = Array.isArray(res.data) ? res.data : [];
            if (results.length === 0) {
                target.innerHTML = '<p class="notice">' + t('search_no_results', 'No results found.') + '</p>';
                return;
            }
            target.innerHTML = results.map(place => {
                let actionLink = '';
                const type = place.type || 'other';
                if (type === 'restaurant' || type === 'cafe' || type === 'food') {
                    actionLink = `<a href="/booking?placeId=${place._id}" class="book-link">${t('home_book_table', 'Book a Table')}</a>`;
                } else if (type === 'clinic') {
                    actionLink = `<a href="/clinics?placeId=${place._id}" class="book-link">${t('home_book_clinic', 'Book Appointment')}</a>`;
                } else if (type === 'transport' || type === 'station') {
                    actionLink = `<a href="/transport" class="book-link">${t('home_view_transport', 'View Transport')}</a>`;
                } else if (type === 'toilet') {
                    actionLink = `<a href="/toilets" class="book-link">${t('home_view_restroom', 'View Restroom')}</a>`;
                } else if (type === 'mosque') {
                    actionLink = `<a href="/mosques" class="book-link">${t('home_view_mosque', 'View Mosque')}</a>`;
                } else {
                    actionLink = `<a href="/services/request?placeId=${place._id}" class="book-link">${t('home_request_service', 'Request Service')}</a>`;
                }

                return `
                <article class="card">
                    <img src="${place.coverImage || '/photos/pizzaria.jpg'}" alt="${place.name}">
                    <div class="card-content">
                        <h3>${place.name}</h3>
                        <span class="category-badge" style="display:inline-block;padding:2px 8px;font-size:0.75rem;background:var(--primary-light);color:var(--primary);border:1px solid var(--primary-border);border-radius:4px;margin-bottom:8px;text-transform:capitalize;font-weight:600;">${t('type_' + type, type)}</span>
                        <p>${place.description || ''}</p>
                        <div style="margin-top:8px">
                            ${actionLink}
                        </div>
                    </div>
                </article>
                `;
            }).join('');
        } catch (err) {
            target.innerHTML = `<p class="error-message">${t('search_failed', 'Search failed: ')} ${err.message}</p>`;
        }
    });

    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name')?.value.trim();
        const email = document.getElementById('contact-email')?.value.trim();
        const message = document.getElementById('contact-message')?.value.trim();
        const resultEl = document.getElementById('contact-result');
        resultEl.textContent = t('contact_sending', 'Sending…');
        try {
            await API.post('/contact', { name, email, message });
            resultEl.textContent = t('contact_sent', 'Message sent. Thank you!');
            contactForm.reset();
        } catch (err) {
            resultEl.textContent = `${t('contact_failed', 'Failed to send: ')} ${err.message}`;
        }
    });
});