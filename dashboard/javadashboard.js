document.addEventListener('DOMContentLoaded', () => {
    
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: none; justify-content: center; align-items: center; z-index: 9999;
        }
        .custom-modal-box {
            background: #fff; padding: 25px; border-radius: 8px;
            max-width: 400px; width: 90%; text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3); font-family: sans-serif;
            color: #333;
        }
        .custom-modal-box h3 { margin-top: 0; color: #d9534f; }
        .custom-modal-box p { text-align: left; line-height: 1.5; font-size: 15px; }
        .custom-modal-btn {
            margin-top: 15px; padding: 8px 20px; background: #333;
            color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;
        }
        .custom-modal-btn:hover { background: #555; }
    `;
    document.head.appendChild(style);

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'custom-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="custom-modal-box">
            <h3>Invalid Entry</h3>
            <p id="custom-modal-text"></p>
            <button class="custom-modal-btn" id="custom-modal-close">Close</button>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    const modalText = document.getElementById('custom-modal-text');
    const modalClose = document.getElementById('custom-modal-close');

    modalClose.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
    });

    const tableBody = document.getElementById('reservation-table-body');
    const statTotal = document.getElementById('stat-total');
    const statPending = document.getElementById('stat-pending');
    const statCancelled = document.getElementById('stat-cancelled');
    const addForm = document.getElementById('addReservationForm');

    if (addForm) {
        addForm.setAttribute('novalidate', 'true'); 
    }

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

    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const nameInput = document.getElementById('resName');
            const guestsInput = document.getElementById('resGuests');
            const dateTimeInput = document.getElementById('resDateTime');

            const name = nameInput.value.trim(); 
            const guests = guestsInput.value.trim(); 
            const dateTime = dateTimeInput.value;

            let errors = []; 

            const nameRegex = /^[A-Za-z\s]+$/;
            if (!name || !nameRegex.test(name)) {
                errors.push("<b>❌ Name Error:</b> Please use ONLY letters and spaces.");
            }

            const guestsRegex = /^[1-9]\d*$/;
            if (!guests || !guestsRegex.test(guests)) {
                errors.push("<b>❌ Guest Error:</b> Please enter a positive number (1 or more).");
            }

            if (!dateTime) {
                errors.push("<b>❌ Date Error:</b> Please select a date and time.");
            } else {
                const selectedDate = new Date(dateTime);
                const currentDate = new Date();
                
                if (selectedDate <= currentDate) {
                    errors.push("<b>❌ Date Error:</b> Please select a date and time in the future.");
                }
            }

            if (errors.length > 0) {
                modalText.innerHTML = errors.join('<br><br>');
                modalOverlay.style.display = 'flex';
                return; 
            }

            const newRow = document.createElement('tr');
            newRow.className = 'res-row';
            newRow.setAttribute('data-status', 'Pending'); 

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

            tableBody.appendChild(newRow);
            
            this.reset();
            updateStats();
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;

            const statusText = row.querySelector('.status-text');

            if (target.classList.contains('btn-confirm')) {
                row.setAttribute('data-status', 'Confirmed');
                statusText.innerText = 'Confirmed';
                updateStats();
            }

            if (target.classList.contains('btn-cancel')) {
                row.setAttribute('data-status', 'Cancelled');
                statusText.innerText = 'Cancelled';
                updateStats();
            }
        });
    }
});