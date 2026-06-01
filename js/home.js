document.addEventListener("DOMContentLoaded", () => {
    
    const localBusinesses = [
        {
            name: "Neighborhood Pizzeria",
            description: "Authentic wood-fired pizza right around the corner.",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
            link: "/pages/booking.ejs",
            linkText: "Book a Table"
        },
        {
            name: "Sayed Electric & Plumbing",
            description: "Reliable home maintenance and emergency repairs.",
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
            link: "/pages/booking.ejs",
            linkText: "Request service"
        },
        {
            name: "Local Transport Hub",
            description: "Track microbuses and find the nearest stations in real-time.",
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
            link: "/pages/transport.ejs",
            linkText: "View Schedule"
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
        target.innerHTML = '<p class="loading-message">Searching &hellip;</p>';
        try {
            let url = `/places?limit=24`;
            if (q) url += `&search=${encodeURIComponent(q)}`;
            if (cat && cat !== 'all') url += `&type=${encodeURIComponent(cat)}`;
            const res = await API.get(url);
            const results = Array.isArray(res.data) ? res.data : [];
            if (results.length === 0) {
                target.innerHTML = '<p class="notice">No results found.</p>';
                return;
            }
            target.innerHTML = results.map(place => `
                <article class="card">
                    <img src="${place.coverImage || '/photos/pizzaria.jpg'}" alt="${place.name}">
                    <div class="card-content">
                        <h3>${place.name}</h3>
                        <p>${place.description || ''}</p>
                        <div style="margin-top:8px">
                            ${place.type === 'restaurant' || place.type === 'food' ? `<a href="/booking" class="book-link">Book at this Restaurant</a>` : ''}
                            ${place.type === 'clinic' ? `<a href="/clinics" class="book-link">Book Appointment</a>` : ''}
                            ${place.type === 'transport' ? `<a href="/transport" class="book-link">View Transport</a>` : ''}
                        </div>
                    </div>
                </article>
            `).join('');
        } catch (err) {
            target.innerHTML = `<p class="error-message">Search failed: ${err.message}</p>`;
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
        resultEl.textContent = 'Sending…';
        try {
            await API.post('/contact', { name, email, message });
            resultEl.textContent = 'Message sent. Thank you!';
            contactForm.reset();
        } catch (err) {
            resultEl.textContent = `Failed to send: ${err.message}`;
        }
    });
});