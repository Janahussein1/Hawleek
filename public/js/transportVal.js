document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("transportBookingForm");
    const stationInput = document.querySelector('input[type="number"]');

    if (stationInput && stationInput.id !== "serviceType") {
        stationInput.addEventListener("input", function() {
            if (parseInt(this.value) < 0) {
                showToast("Number of stations or KMs cannot be a negative number!", "error");
                this.value = 1; 
            }
        });
    }

    if (!form) return;
    
    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const date        = document.getElementById("travelDate")?.value;
        const seats       = parseInt(document.getElementById("numSeats")?.value) || 1;
        const stationId   = document.getElementById("stationId")?.value;
        const routeIndex  = document.getElementById("routeIndex")?.value;
        const email       = document.getElementById("tEmail")?.value.trim();

        if (!date) { 
            showToast("Please select a travel date", "error"); 
            return; 
        }
        
        if (new Date(date) < new Date().setHours(0,0,0,0)) {
            showToast("Date cannot be in the past", "error"); 
            return; 
        }
        
        if (seats < 1) { 
            showToast("At least 1 seat required", "error"); 
            return; 
        }

        const submitBtn = form.querySelector("button[type=submit]");
        showSpinner(submitBtn);

        try {
            await API.post("/bookings/guest", {
                placeId:      stationId,
                type:         "seat",
                date:         date,
                time:         "08:00",
                seatsBooked:  seats,
                routeIndex:   parseInt(routeIndex),
                contactEmail: email,
            });

            showToast(`${seats} seat(s) booked! Check ${email} for confirmation.`, "success");
            form.reset();
        } catch (err) {
            showToast(`Booking failed: ${err.message}`, "error");
        } finally {
            hideSpinner(submitBtn);
        }
    });
});