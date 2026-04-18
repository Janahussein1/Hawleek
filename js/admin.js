document.addEventListener("DOMContentLoaded", () => {
    const recentBookings = [
        { name: "Ahmed Youssef", service: "Neighborhood Pizzeria", date: "2026-04-20", status: "Confirmed" },
        { name: "Sarah Khaled", service: "Sayed Electric", date: "2026-04-21", status: "Pending" },
        { name: "Omar Tarek", service: "Neighborhood Pizzeria", date: "2026-04-22", status: "Confirmed" }
    ];

    const bookingsTable = document.getElementById("bookingsTable");
    
    if (bookingsTable) {
        recentBookings.forEach(booking => {
            const badgeClass = booking.status === 'Confirmed' ? 'on-time' : 'delayed';
            
            const row = `<tr>
                <td>${booking.name}</td>
                <td>${booking.service}</td>
                <td>${booking.date}</td>
                <td><span class="status-badge ${badgeClass}">${booking.status}</span></td>
            </tr>`;
            bookingsTable.innerHTML += row;
        });
    }

    const addBusinessForm = document.getElementById("addBusinessForm");
    
    if (addBusinessForm) {
        addBusinessForm.addEventListener("submit", (e) => {
            e.preventDefault(); 

            const bizName = document.getElementById("bizName").value.trim();
            const bizCategory = document.getElementById("bizCategory").value;

            if (bizName === "" || /\d/.test(bizName)) {
                alert("Please enter a valid business name (no numbers).");
                return;
            }

            if (bizCategory === "") {
                alert("Please select a category.");
                return;
            }

            alert(`Success! "${bizName}" has been added to the local directory.`);
            addBusinessForm.reset();
        });
    }
});