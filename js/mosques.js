document.addEventListener("DOMContentLoaded", () => {
    const mosquesData = [
        {
            name: "Al-Rahman Mosque",
            description: "Main Street, 5 mins walk from Dokki Square.",
            image: "/photos/mosque.jpg",
            status: "Open Now",
            directionsText: "Head south on Dokki Street, turn left at Main Street, then continue 350m to the mosque.",
            directionsLink: "https://www.google.com/maps/dir/?api=1&destination=30.0384,31.2114&travelmode=walking"
        },
        {
            name: "Al-Nour Mosque",
            description: "West District, women-friendly prayer hall.",
            image: "/photos/mosque2.jpg",
            status: "Friday Prayers",
            directionsText: "From West Avenue, turn right at Market Street and walk 600m to the mosque entrance.",
            directionsLink: "https://www.google.com/maps/dir/?api=1&destination=30.0396,31.2008&travelmode=walking"
        }
    ];

    const servicesWrapper = document.querySelector(".services-wrapper");

    if (servicesWrapper) {
        servicesWrapper.innerHTML = ""; 

        mosquesData.forEach((mosque) => {
            const cardHTML = `
                <article class="card">
                    <img src="${mosque.image}" alt="${mosque.name}">
                    <div class="cards-content">
                        <span class="status-tag">${mosque.status}</span>
                        <h3>${mosque.name}</h3>
                        <p>${mosque.description}</p>
                        <p class="directions-note">${mosque.directionsText}</p>
                        <a href="${mosque.directionsLink}" target="_blank" rel="noreferrer" class="book-link">Open Route</a>
                    </div>
                </article>
            `;
            servicesWrapper.innerHTML += cardHTML;
        });
    }
});