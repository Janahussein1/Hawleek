document.addEventListener("DOMContentLoaded", () => {
    
    const mosquesData = [
        {
            name: "Al-Rahman Grand Mosque",
            description: "Main neighborhood mosque. Holds Friday Jumu'ah prayers.",
            image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800",
            status: "Open Now",
            actionText: "View Times",
            contactText: "Call Imam"
        },
        {
            name: "El-Nour Community Mosque",
            description: "Quiet local mosque offering evening Quran memorization classes.",
            image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800",
            status: "Closes at 10 PM",
            actionText: "View Classes",
            contactText: "Contact Admin"
        },
        {
            name: "Masjid Al-Salam",
            description: "Located near the transport hub. Fully wheelchair accessible.",
            image: "https://images.unsplash.com/photo-1608023136037-3363ad92a953?w=800",
            status: "Open Now",
            actionText: "Directions",
            contactText: "Call Office"
        }
    ];

    const mosquesWrapper = document.getElementById("mosquesWrapper");

    if (mosquesWrapper) {
        mosquesData.forEach((mosque) => {
            // Generating HTML that strictly matches your new Emerald Green CSS
            const cardHTML = `
                <div class="card">
                    <img src="${mosque.image}" alt="${mosque.name}">
                    <div class="cards-content">
                        <span class="status-tag">${mosque.status}</span>
                        <h3>${mosque.name}</h3>
                        <p>${mosque.description}</p>
                        
                        <a href="#" class="book-link">${mosque.actionText}</a>
                        <a href="#" class="call-link">${mosque.contactText}</a>
                    </div>
                </div>
            `;
            mosquesWrapper.innerHTML += cardHTML;
        });
    }
});