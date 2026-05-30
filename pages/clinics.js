document.addEventListener("DOMContentLoaded", () => {
    const injectedHTML = `
        <div id="bookingModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:1000; justify-content:center; align-items:center;">
            <div style="background:#fff; padding:30px; border-radius:10px; width:90%; max-width:400px; position:relative; font-family:sans-serif;">
                <span id="closeModal" style="position:absolute; right:20px; top:15px; cursor:pointer; font-size:24px; color:#333;">&times;</span>
                <h2 style="margin-top:0; color:#333;">Book Appointment</h2>
                <form id="bookingForm">
                    <div style="margin-bottom:15px;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555;">Full Name:</label>
                        <input type="text" id="patientName" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;" placeholder="e.g. Ahmed Ali">
                    </div>
                    <div style="margin-bottom:15px;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555;">Phone Number:</label>
                        <input type="text" id="patientPhone" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;" placeholder="e.g. 01012345678">
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555;">Age:</label>
                        <input type="text" id="patientAge" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;" placeholder="e.g. 25">
                    </div>
                    <button type="submit" style="width:100%; padding:12px; background:#0056b3; color:white; border:none; border-radius:5px; cursor:pointer; font-size:16px; font-weight:bold;">Confirm Booking</button>
                </form>
            </div>
        </div>

        <div id="customAlert" style="display:none; position:fixed; bottom:30px; right:30px; background:#e74c3c; color:white; padding:15px 20px; border-radius:8px; z-index:1001; box-shadow: 0 4px 10px rgba(0,0,0,0.2); font-family:sans-serif;">
            <strong>Error:</strong> <span id="alertMessage"></span>
        </div>

        <div id="successAlert" style="display:none; position:fixed; bottom:30px; right:30px; background:#2ecc71; color:white; padding:15px 20px; border-radius:8px; z-index:1001; box-shadow: 0 4px 10px rgba(0,0,0,0.2); font-family:sans-serif;">
            <strong>Success!</strong> Your appointment has been booked.
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', injectedHTML);

    const modal = document.getElementById('bookingModal');
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('bookingForm');
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const successAlert = document.getElementById('successAlert');

    const bookLinks = document.querySelectorAll('.book-link');
    bookLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            modal.style.display = 'flex'; 
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    function showInPageAlert(message) {
        alertMessage.textContent = message;
        customAlert.style.display = 'block';
        
        setTimeout(() => { 
            customAlert.style.display = 'none'; 
        }, 4000);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const name = document.getElementById('patientName').value.trim();
        const phone = document.getElementById('patientPhone').value.trim();
        const age = document.getElementById('patientAge').value.trim();

        const nameRegex = /^[A-Za-z\s]+$/; 
        const phoneRegex = /^\d{10,15}$/; 
        const ageRegex = /^\d{1,3}$/; 

        if (!name || !phone || !age) {
            showInPageAlert("You cannot skip any fields. Please fill out everything.");
            return; 
        }

        if (!nameRegex.test(name)) {
            showInPageAlert("Name must contain only letters. No numbers or special characters allowed.");
            return;
        }

        if (!phoneRegex.test(phone)) {
            showInPageAlert("Phone must contain only positive numbers (10 to 15 digits). No letters.");
            return;
        }

        if (!ageRegex.test(age) || parseInt(age) === 0) {
            showInPageAlert("Age must be a valid positive number. No negatives or letters.");
            return;
        }

        modal.style.display = 'none'; 
        form.reset(); 
        
        successAlert.style.display = 'block';
        setTimeout(() => { 
            successAlert.style.display = 'none'; 
        }, 4000);
    });
});