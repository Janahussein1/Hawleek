document.addEventListener("DOMContentLoaded", () => {
    const localBusinesses = [
        {
            name: "Neighborhood Pizzeria",
            description: "Authentic wood-fired pizza right around the corner.",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
            link: "pages/booking.html",
            linkText: "Book a Table"
        },
        {
            name: "Sayed Electric & Plumbing",
            description: "Reliable home maintenance and emergency repairs.",
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
            link: "pages/booking.html",
            linkText: "Request service"
        },
        {
            name: "Local Transport Hub",
            description: "Track microbuses and find the nearest stations in real-time.",
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
            link: "pages/transport.html",
            linkText: "View Schedule"
        }
    ];

    const servicesWrapper = document.querySelector(".services-wrapper");

    if (servicesWrapper) {
        servicesWrapper.innerHTML = ""; 

        localBusinesses.forEach((business, index) => {
            const delay = (index + 1) * 0.2; 
            
            const cardHTML = `
                <article class="card" style="animation-delay: ${delay}s">
                    <img src="${business.image}" alt="${business.name}">
                    <div class="card-content">
                        <h3>${business.name}</h3>
                        <p>${business.description}</p>
                        <a href="${business.link}" class="book-link">${business.linkText}</a>
                    </div>
                </article>
            `;
            servicesWrapper.innerHTML += cardHTML;
        });
    }

    const transportType = document.getElementById("transportType");
    const stationInput = document.querySelector('input[type="number"]');
    const fareOutput = document.querySelector('span#fareResult'); 

    if (transportType && stationInput && fareOutput) {
        const calculateFare = () => {
            const type = transportType.value;
            let units = parseInt(stationInput.value) || 0;
            let fare = 0;

            if (type === "metro") {
                if (units <= 9) fare = 8;
                else if (units <= 16) fare = 10;
                else fare = 15;
            } else if (type === "microbus") {
                fare = units * 3.5; 
            } else if (type === "bus") {
                fare = 7; 
            }

            fareOutput.textContent = fare.toFixed(2);
        };

        transportType.addEventListener("change", calculateFare);
        stationInput.addEventListener("input", calculateFare);
    }
});
