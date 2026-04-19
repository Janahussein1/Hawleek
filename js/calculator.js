document.addEventListener("DOMContentLoaded", () => {
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