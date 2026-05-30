document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Initialize map (Centers on Dokki by default just in case location is turned off)
    const map = L.map('interactiveMap').setView([30.0384, 31.2114], 15);

    // 2. Load the free map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 3. Find the User's Live Location!
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Center map on user
                map.setView([userLat, userLng], 15);

                // Create a special Blue Marker for the user's location
                const userIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                // Drop the pin and add a pop-up
                L.marker([userLat, userLng], {icon: userIcon})
                 .addTo(map)
                 .bindPopup("<b style='font-family:sans-serif;'>📍 You are here!</b>")
                 .openPopup();
            },
            () => {
                console.log("User denied location access or it failed.");
            }
        );
    }

    // 4. Our Database of Toilets around Dokki
    const toilets = [
        { id: 1, name: "Dokki Square Public Restroom", lat: 30.0384, lng: 31.2114, status: "Clean & Open", dist: "0.1 km" },
        { id: 2, name: "Shooting Club External Facilities", lat: 30.0410, lng: 31.2030, status: "Accessible", dist: "0.8 km" },
        { id: 3, name: "Mesaha Square Mall Toilet", lat: 30.0350, lng: 31.2150, status: "Ground Floor", dist: "0.6 km" },
        { id: 4, name: "Galaa Square Gas Station", lat: 30.0435, lng: 31.2185, status: "Key needed (ask staff)", dist: "1.1 km" }
    ];

    const sidebarList = document.getElementById('sidebarList');
    const markers = {}; 

    // 5. Loop through toilets to add Red Dots on map and Cards in sidebar
    toilets.forEach(toilet => {
        
        const marker = L.circleMarker([toilet.lat, toilet.lng], {
            color: '#c0392b',      
            fillColor: '#e74c3c',  
            fillOpacity: 0.8,
            radius: 10             
        }).addTo(map);

        const popupContent = `
            <div style="font-family:sans-serif; text-align:center;">
                <h4 style="margin:0 0 5px 0; color:#333;">${toilet.name}</h4>
                <p style="margin:0 0 5px 0; font-size:12px; color:#666;">Status: ${toilet.status}</p>
            </div>
        `;
        marker.bindPopup(popupContent);
        markers[toilet.id] = marker; 

        const cardHTML = `
            <div class="location-card" data-id="${toilet.id}">
                <h3>${toilet.name}</h3>
                <p>Status: ${toilet.status}</p>
                <span class="distance-tag">${toilet.dist} away</span>
            </div>
        `;
        sidebarList.insertAdjacentHTML('beforeend', cardHTML);
    });

    // 6. Sidebar clicking functionality
    const cards = document.querySelectorAll('.location-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            cards.forEach(c => c.style.borderColor = '#e0e0e0');
            e.currentTarget.style.borderColor = '#0056b3';

            const id = e.currentTarget.getAttribute('data-id');
            const targetMarker = markers[id];

            map.setView(targetMarker.getLatLng(), 16);
            targetMarker.openPopup();
        });
    });
});