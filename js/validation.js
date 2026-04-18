document.addEventListener("DOMContentLoaded", () => {
    const appointmentForm = document.getElementById("appointmentForm");
    const vendorSelect = document.getElementById("vendor");
    const serviceTypeInput = document.getElementById("serviceType");
    const serviceTypeLabel = document.querySelector('label[for="serviceType"]');

    if (vendorSelect && serviceTypeInput && serviceTypeLabel) {
        vendorSelect.addEventListener("change", function() {
            if (this.value === "pizzeria") {
                serviceTypeLabel.textContent = "Number of Guests:";
                serviceTypeInput.type = "number";
                serviceTypeInput.min = "1";
                serviceTypeInput.placeholder = "e.g., 4";
            } else if (this.value === "elecrician") {
                serviceTypeLabel.textContent = "Describe the Issue:";
                serviceTypeInput.type = "text";
                serviceTypeInput.removeAttribute("min");
                serviceTypeInput.placeholder = "e.g., Leaking pipe, AC broken";
            } else {
                serviceTypeLabel.textContent = "Type of Service:";
                serviceTypeInput.type = "text";
                serviceTypeInput.placeholder = "e.g. Table for 4, or AC Repair";
            }
        });
    }

    if (appointmentForm) {
        appointmentForm.addEventListener("submit", function(event) {
            event.preventDefault(); 

            const vendor = vendorSelect.value;
            const serviceTypeValue = serviceTypeInput.value.trim();
            const fullName = document.getElementById("fullName").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const date = document.getElementById("date").value;

            if (vendor === "") {
                alert("Please select a Business/Vendor.");
                return;
            }

            if (vendor === "pizzeria") {
                if (serviceTypeValue === "" || parseInt(serviceTypeValue) <= 0) {
                    alert("For restaurant bookings, please enter a valid Number of Guests (must be 1 or more).");
                    return;
                }
            } else if (vendor === "elecrician") {
                if (serviceTypeValue === "") {
                    alert("For maintenance requests, please describe the issue you are facing.");
                    return;
                }
            }

            if (fullName === "") {
                alert("Please enter your full name.");
                return;
            }
            
            if (/\d/.test(fullName)) {
                alert("Error: Full Name cannot contain numbers. Please enter a valid name.");
                return;
            }
            
            const phoneRegex = /^01[0125][0-9]{8}$/;
            if (!phoneRegex.test(phone)) {
                alert("Please enter a valid Egyptian phone number (e.g., 010xxxxxxxx).");
                return;
            }
            
            if (date === "") {
                alert("Please select a preferred date.");
                return;
            }

            alert(`Success! Your booking request for ${fullName} has been submitted.`);
            appointmentForm.reset(); 
            
            serviceTypeLabel.textContent = "Type of Service:";
            serviceTypeInput.type = "text";
            serviceTypeInput.placeholder = "e.g. Table for 4, or AC Repair";
        });
    }

    const stationInput = document.querySelector('input[type="number"]');
    
    if (stationInput && stationInput.id !== "serviceType") {
        stationInput.addEventListener("input", function() {
            if (this.value < 0) {
                alert("Number of stations or KMs cannot be a negative number!");
                this.value = 1; 
            }
        });
    }
});