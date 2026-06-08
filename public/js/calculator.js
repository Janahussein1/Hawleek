document.addEventListener("DOMContentLoaded", () => {
    // --- Fare Calculator Logic ---
    const transportType = document.getElementById("transportType");
    const stationInput = document.getElementById("stations"); 
    const fareOutput = document.getElementById("fareResult"); 

    if (transportType && stationInput && fareOutput) {
        const calculateFare = () => {
            if (stationInput.value < 0) {
                alert("Number of stations or KMs cannot be less than 0!");
                stationInput.value = 0; 
            }

            const type = transportType.value;
            let units = parseInt(stationInput.value) || 0;
            let fare = 0;

            if (type === "metro") {
                if (units === 0) fare = 0;
                else if (units <= 9) fare = 8;
                else if (units <= 16) fare = 10;
                else fare = 15;
            } else if (type === "microbus") {
                fare = units * 3.5; 
            } else if (type === "bus") {
                if (units > 0) fare = 7; 
                else fare = 0;
            }

            fareOutput.textContent = fare.toFixed(2);
        };

        transportType.addEventListener("change", calculateFare);
        stationInput.addEventListener("input", calculateFare);
    }

    // --- Route Finder Logic ---
    const findRouteBtn = document.getElementById("findRouteBtn");
    const destinationInput = document.getElementById("destination");
    const routeResults = document.getElementById("routeResults");

    if (findRouteBtn && destinationInput && routeResults) {
        findRouteBtn.addEventListener("click", () => {
            const dest = destinationInput.value.trim();
            if (!dest) {
                routeResults.innerHTML = '<span style="color:#d9534f; font-size: 0.9rem;">Please enter a destination to search.</span>';
                return;
            }

            findRouteBtn.textContent = "Searching...";
            findRouteBtn.disabled = true;

            // Simulate API request delay
            setTimeout(() => {
                routeResults.innerHTML = `
                    <div style="padding: 15px; background: #e6fffa; border: 1px solid #0f6e56; border-radius: 8px; font-size: 0.9rem;">
                        <strong style="color: #0f6e56; font-size: 1rem;">Best Route to ${dest}:</strong><br><br>
                        1. Take <strong>Metro Line 2</strong> to Sadat Station (10 mins)<br>
                        2. Transfer to <strong>Microbus</strong> heading to ${dest} (15 mins)<br><br>
                        <em style="color: #555;">Estimated Travel Time: 25 mins</em>
                    </div>
                `;
                findRouteBtn.textContent = "Find The Best Route";
                findRouteBtn.disabled = false;
            }, 800);
        });
    }
});