document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize map (Centers on Dokki by default)
  const map = L.map('interactiveMap').setView([30.0384, 31.2114], 15);

  // 2. Load the free map tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let userCoords = null;
  let currentCenter = { lat: 30.0384, lng: 31.2114 };
  const markers = {};

  // Haversine formula to compute distance in km
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Fetch nearby malls and petrol stations via Overpass API
  async function fetchNearbyMallsAndPetrolStations(lat, lng) {
    const query = `[out:json][timeout:15];(node["amenity"="fuel"](around:3000,${lat},${lng});node["shop"="mall"](around:3000,${lat},${lng});way["shop"="mall"](around:3000,${lat},${lng}););out center;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Overpass API returned status ' + response.status);
    const data = await response.json();
    
    const places = [];
    if (data && data.elements) {
      data.elements.forEach((el, index) => {
        const tags = el.tags || {};
        const isFuel = tags.amenity === 'fuel';
        const name = tags.name || (isFuel ? t('toilet_petrol_station', 'Petrol Station') : t('toilet_shopping_mall', 'Shopping Mall'));
        const itemLat = el.lat || el.center?.lat;
        const itemLng = el.lon || el.center?.lon;
        if (!itemLat || !itemLng) return;
        
        places.push({
          _id: `overpass-${el.id || index}`,
          name: name + t('toilet_restrooms_avail', ' (Restrooms Available)'),
          type: 'toilet',
          address: tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : (isFuel ? t('toilet_petrol_road', 'Petrol Station Road') : t('toilet_shopping_area', 'Shopping Area')),
          openingHours: tags.opening_hours || (isFuel ? t('toilet_open_24h', 'Open 24 Hours') : t('toilet_mall_hours', '10:00 AM - 11:00 PM')),
          description: isFuel ? t('toilet_desc_fuel', 'Clean restrooms inside fuel station.') : t('toilet_desc_mall', 'Public restrooms inside the shopping mall.'),
          neighborhood: tags['addr:suburb'] || tags['addr:city'] || (isFuel ? t('toilet_fuel_station', 'Fuel Station') : t('toilet_mall', 'Mall')),
          location: { lat: itemLat, lng: itemLng }
        });
      });
    }
    return places;
  }



  // 3. Main loader function
  async function loadToilets() {
    const sidebarList = document.getElementById('sidebarList');
    if (!sidebarList) return;

    sidebarList.innerHTML = '<p style="padding:16px;color:#888;">' + t('toilet_loading', 'Loading restrooms near you...') + '</p>';

    // Clear old markers from the map
    for (const id in markers) {
      map.removeLayer(markers[id]);
      delete markers[id];
    }

    try {
      // Fetch restrooms from backend
      const res = await API.get('/places?type=toilet&limit=50');
      let toilets = Array.isArray(res.data) ? res.data : [];

      // Combine with real-time POIs based on current map center
      if (currentCenter) {
        try {
          // Increase radius to 5000m to ensure we find places
          const query = `[out:json][timeout:15];(node["amenity"="fuel"](around:5000,${currentCenter.lat},${currentCenter.lng});node["shop"="mall"](around:5000,${currentCenter.lat},${currentCenter.lng});way["shop"="mall"](around:5000,${currentCenter.lat},${currentCenter.lng}););out center;`;
          const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
          
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            const places = [];
            if (data && data.elements) {
              data.elements.forEach((el, index) => {
                const tags = el.tags || {};
                const isFuel = tags.amenity === 'fuel';
                const name = tags.name || (isFuel ? t('toilet_petrol_station', 'Petrol Station') : t('toilet_shopping_mall', 'Shopping Mall'));
                const itemLat = el.lat || el.center?.lat;
                const itemLng = el.lon || el.center?.lon;
                if (!itemLat || !itemLng) return;
                
                places.push({
                  _id: `overpass-${el.id || index}`,
                  name: name + t('toilet_restrooms_avail', ' (Restrooms Available)'),
                  type: 'toilet',
                  address: tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : (isFuel ? t('toilet_petrol_station', 'Petrol Station') : t('toilet_shopping_area', 'Shopping Area')),
                  openingHours: tags.opening_hours || (isFuel ? t('toilet_open_24h', 'Open 24 Hours') : t('toilet_mall_hours', '10:00 AM - 11:00 PM')),
                  description: isFuel ? t('toilet_desc_fuel2', 'Restrooms inside fuel station.') : t('toilet_desc_mall', 'Public restrooms inside the shopping mall.'),
                  neighborhood: tags['addr:suburb'] || tags['addr:city'] || (isFuel ? t('toilet_fuel_station', 'Fuel Station') : t('toilet_mall', 'Mall')),
                  location: { lat: itemLat, lng: itemLng }
                });
              });
            }
            if (places.length > 0) {
              toilets = [...toilets, ...places];
            } else {
              console.warn('No places found within 5km from Overpass API.');
            }
          } else {
             console.warn('Overpass fetch failed with status:', response.status);
          }
        } catch (err) {
          console.warn('Overpass fetch failed:', err.message);
        }
      }

        // If we have user coordinates, filter toilets within 5km radius and sort by distance
        if (userCoords) {
          const maxDist = 5; // km
          toilets = toilets.filter(t => {
            const lat = t.location?.lat;
            const lng = t.location?.lng;
            if (!lat || !lng) return false;
            const dist = calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
            return dist <= maxDist;
          }).map(t => {
            const lat = t.location.lat;
            const lng = t.location.lng;
            t._distance = calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
            return t;
          }).sort((a, b) => a._distance - b._distance);
        }

      sidebarList.innerHTML = '';

      // Render pins and cards
      toilets.forEach(toilet => {
        const lat = toilet.location?.lat;
        const lng = toilet.location?.lng;
        if (!lat || !lng) return;

        // Leaflet Marker
        const marker = L.circleMarker([lat, lng], {
          color: '#c0392b',      
          fillColor: '#e74c3c',  
          fillOpacity: 0.8,
          radius: 10             
        }).addTo(map);

        const popupContent = `
          <div style="font-family:sans-serif; text-align:center;">
            <h4 style="margin:0 0 5px 0; color:#333;">${toilet.name}</h4>
            <p style="margin:0 0 3px 0; font-size:12px; color:#666;">${t('toilet_status', 'Status: ')}${toilet.openingHours || t('toilet_open', 'Open')}</p>
            <p style="margin:0; font-size:11px; color:#888;">${toilet.address}</p>
          </div>
        `;
        marker.bindPopup(popupContent);
        markers[toilet._id] = marker;

        // Calculate dynamic distance if user coordinates are available
        let distanceText = toilet.neighborhood || t('toilet_nearby', 'Nearby');
        if (userCoords) {
          const distance = calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
          distanceText = `${distance.toFixed(2)}${t('toilet_km_away', ' km away')}`;
        }

        const cardHTML = `
          <div class="location-card" data-id="${toilet._id}">
            <h3>${toilet.name}</h3>
            <p>${t('toilet_status', 'Status: ')}<span style="font-weight:600; color:#c0392b">${toilet.openingHours || t('toilet_open', 'Open')}</span></p>
            <p style="font-size:0.8rem; color:#888; margin: 4px 0;">${toilet.description || ''}</p>
            <span class="distance-tag">${distanceText}</span>
          </div>
        `;
        sidebarList.insertAdjacentHTML('beforeend', cardHTML);
      });

      // Hook up card clicking
      const cards = document.querySelectorAll('.location-card');
      cards.forEach(card => {
        card.addEventListener('click', (e) => {
          cards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');

          const id = e.currentTarget.getAttribute('data-id');
          const targetMarker = markers[id];
          if (targetMarker) {
            map.setView(targetMarker.getLatLng(), 16);
            targetMarker.openPopup();
          }
        });
      });

    } catch (err) {
      console.error('Error loading restrooms:', err);
      sidebarList.innerHTML = `<p style="padding:16px;color:red;">${t('toilet_load_error', 'Error loading restrooms: ')}${err.message}</p>`;
    }
  }

  // 4. Find user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        userCoords = { lat: userLat, lng: userLng };
        currentCenter = { lat: userLat, lng: userLng };

        // Center map on user
        map.setView([userLat, userLng], 15);

        // Special icon for user
        const userIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        L.marker([userLat, userLng], {icon: userIcon})
         .addTo(map)
         .bindPopup("<b style='font-family:sans-serif;'>📍 ' + t('toilet_you_are_here', 'You are here!') + '</b>")
         .openPopup();

        // Load restrooms after receiving user coordinates to show exact distances
        loadToilets();
      },
      () => {
        console.log("User denied location access or it failed. Falling back to default center.");
        loadToilets();
      }
    );
  } else {
    loadToilets();
  }

  // Reload dynamically when map is moved
  map.on('moveend', () => {
    const center = map.getCenter();
    currentCenter = { lat: center.lat, lng: center.lng };
    loadToilets();
  });
});
