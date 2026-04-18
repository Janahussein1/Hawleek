document.addEventListener('DOMContentLoaded', () => {
    
    const bookingForm = document.getElementById('clientBookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            // Gather data (including the hidden fields)
            const newBooking = {
                name: document.getElementById('clientName').value.trim(),
                category: document.getElementById('clientCategory').value, 
                provider: document.getElementById('clientProvider').value, 
                guests: document.getElementById('clientGuests').value,
                datetime: document.getElementById('clientDate').value,
                status: "Pending" 
            };

            // Save to Local Storage (The Shared Brain)
            const allRes = JSON.parse(localStorage.getItem("hawaleek_reservations")) || [];
            allRes.push(newBooking);
            localStorage.setItem("hawaleek_reservations", JSON.stringify(allRes));

            alert("Success! Your booking has been sent.");
            this.reset();
        });
    }
});