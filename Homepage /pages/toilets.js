let map;
let infoWindow;
const markers = {}; 

// This function is called automatically by the Google Maps script in your HTML
function initMap() {
    
    // 1. Center the map on Dokki, Cairo
    const dokkiCenter = { lat: 30.0384, lng: 31.2114 };
    
    map = new google.maps.Map(document.getElementById("interactiveMap"), {
        zoom: 15,
        center: dokkiCenter,
        mapTypeControl: false // Cleans up the UI a bit
    });

    infoWindow = new google.maps.InfoWindow();

    // 2. Our Database of Toilets around Dokki
    const toilets = [
        { id: 1, name: "Dokki Square Public Restroom", lat: 30.0384, lng: 31.2114, status: "Clean & Open", dist: "0.1 km" },
        { id: 2, name: "Shooting Club External Facilities", lat: 30.0410, lng: 31.2030, status: "Accessible", dist: "0.8 km" },
        { id: 3, name: "Mesaha Square Mall Toilet", lat: 30.0350, lng: 31.2150, status: "Ground Floor", dist: "0.6 km" },
        { id: 4, name: "Galaa Square Gas Station", lat: 30.0435, lng: 31.2185, status: "Key needed (ask staff)", dist: "1.1 km" }
    ];

    const sidebarList = document.getElementById('sidebarList');

    // 3. Loop through and create map pins and sidebar cards
    toilets.forEach(toilet => {
        
        // Create the Google Maps Marker
        const marker = new google.maps.Marker({
            position: { lat: toilet.lat, lng: toilet.lng },
            map: map,
            title: toilet.name
        });

        markers[toilet.id] = marker;

        // Info Bubble Content
        const popupContent = `
            <div style="font-family:sans-serif; text-align:center; padding:5px;">
                <h4 style="margin:0 0 5px 0; color:#333;">${toilet.name}</h4>
                <p style="margin:0 0 5px 0; font-size:12px; color:#666;">Status: ${toilet.status}</p>
            </div>
        `;

        // Click event for the map pin
        marker.addListener("click", () => {
            infoWindow.setContent(popupContent);
            infoWindow.open(map, marker);
            map.setZoom(16);
            map.setCenter(marker.getPosition());
        });

        // Create the HTML Card for the sidebar
        const cardHTML = `
            <div class="location-card" data-id="${toilet.id}">
                <h3>${toilet.name}</h3>
                <p>Status: ${toilet.status}</p>
                <span class="distance-tag">${toilet.dist} away</span>
            </div>
        `;
        sidebarList.insertAdjacentHTML('beforeend', cardHTML);
    });

    // 4. Click events for the sidebar cards
    const cards = document.querySelectorAll('.location-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            
            // Reset borders
            cards.forEach(c => c.style.borderColor = '#e0e0e0');
            // Highlight clicked card
            e.currentTarget.style.borderColor = '#0056b3';

            // Get the specific marker and trigger a click on it
            const id = e.currentTarget.getAttribute('data-id');
            const targetMarker = markers[id];

            google.maps.event.trigger(targetMarker, 'click');
        });
    });
}