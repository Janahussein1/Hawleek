document.addEventListener('DOMContentLoaded', () => {
    
    const tableBody = document.getElementById('reservation-table-body');
    const statTotal = document.getElementById('stat-total');
    const statPending = document.getElementById('stat-pending');
    const statCancelled = document.getElementById('stat-cancelled');

    // FUNCTION TO COUNT RESERVATIONS
    function updateStats() {
        const rows = document.querySelectorAll('.res-row');
        let total = rows.length;
        let pending = 0;
        let cancelled = 0;

        rows.forEach(row => {
            const status = row.getAttribute('data-status');
            if (status === 'Pending') pending++;
            if (status === 'Cancelled') cancelled++;
        });

        statTotal.innerText = total;
        statPending.innerText = pending;
        statCancelled.innerText = cancelled;
    }

    // FUNCTION TO ADD A NEW RESERVATION
    const addForm = document.getElementById('addReservationForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Stops the page from refreshing

            const name = document.getElementById('resName').value;
            const guests = document.getElementById('resGuests').value;
            const dateTime = document.getElementById('resDateTime').value;

            // Create a new row
            const newRow = document.createElement('tr');
            newRow.className = 'res-row';
            newRow.setAttribute('data-status', 'Pending'); // Default status

            newRow.innerHTML = `
                <td>${name}</td>
                <td>${guests}</td>
                <td>${dateTime.replace('T', ' ')}</td>
                <td class="status-text">Pending</td>
                <td>
                    <button class="btn-confirm">Confirm</button>
                    <button class="btn-cancel">Cancel</button>
                </td>
            `;

            // Add the row to the table
            tableBody.appendChild(newRow);
            
            // Clear the form and update the count
            this.reset();
            updateStats();
        });
    }

    // FUNCTION TO CONFIRM OR CANCEL
    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;

            const statusText = row.querySelector('.status-text');

            // If Confirm button is clicked
            if (target.classList.contains('btn-confirm')) {
                row.setAttribute('data-status', 'Confirmed');
                statusText.innerText = 'Confirmed';
                updateStats();
            }

            // If Cancel button is clicked
            if (target.classList.contains('btn-cancel')) {
                row.setAttribute('data-status', 'Cancelled');
                statusText.innerText = 'Cancelled';
                updateStats();
            }
        });
    }
});
