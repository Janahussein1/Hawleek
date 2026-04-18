document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CUSTOM ERROR MODAL SETUP
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

    // 2. DASHBOARD LOGIC
    const tableBody = document.getElementById('reservation-table-body');
    const statTotal = document.getElementById('stat-total');
    const statPending = document.getElementById('stat-pending');
    const statCancelled = document.getElementById('stat-cancelled');
    const addForm = document.getElementById('addReservationForm');
    const filter = document.getElementById('filterCategory');

    if (!localStorage.getItem("hawaleek_reservations")) {
        localStorage.setItem("hawaleek_reservations", JSON.stringify([]));
    }

    if (addForm) addForm.setAttribute('novalidate', 'true'); 

    function updateStats() {
        const allRes = JSON.parse(localStorage.getItem("hawaleek_reservations")) || [];
        let total = allRes.length;
        let pending = 0;
        let cancelled = 0;

        allRes.forEach(res => {
            if (res.status === 'Pending') pending++;
            if (res.status === 'Cancelled') cancelled++;
        });

        if(statTotal) statTotal.innerText = total;
        if(statPending) statPending.innerText = pending;
        if(statCancelled) statCancelled.innerText = cancelled;
    }

    function renderTable(filterVal = "All") {
        const allRes = JSON.parse(localStorage.getItem("hawaleek_reservations")) || [];
        if (!tableBody) return;
        
        tableBody.innerHTML = ""; 
        const filteredRes = filterVal === "All" ? allRes : allRes.filter(r => r.category === filterVal);

        filteredRes.forEach((res, index) => {
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-index', index); 

            newRow.innerHTML = `
                <td>${res.name}</td>
                <td><strong>${res.category || 'N/A'}</strong></td>
                <td>${res.provider || 'N/A'}</td>
                <td>${res.guests}</td>
                <td>${res.datetime.replace('T', ' ')}</td>
                <td style="font-weight:bold; color:${res.status==='Confirmed'?'green':res.status==='Cancelled'?'red':'orange'}">${res.status}</td>
                <td>
                    <button class="btn-confirm" style="margin-right:5px;">Confirm</button>
                    <button class="btn-cancel">Cancel</button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });

        updateStats();
    }

    // 3. MANUAL ADMIN FORM SUBMISSION
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const name = document.getElementById('resName').value.trim(); 
            const guests = document.getElementById('resGuests').value.trim(); 
            const dateTime = document.getElementById('resDateTime').value;
            const category = document.getElementById('resCategory').value;
            const provider = document.getElementById('resProvider').value.trim();

            let errors = []; 
            if (!name || !/^[A-Za-z\s]+$/.test(name)) errors.push("<b>❌ Name Error:</b> Please use ONLY letters and spaces.");
            if (!guests || !/^[1-9]\d*$/.test(guests)) errors.push("<b>❌ Guest Error:</b> Please enter a positive number.");
            if (!dateTime || new Date(dateTime) <= new Date()) errors.push("<b>❌ Date Error:</b> Select a future date/time.");
            if (!provider) errors.push("<b>❌ Provider Error:</b> Please enter a location.");

            if (errors.length > 0) {
                modalText.innerHTML = errors.join('<br><br>');
                modalOverlay.style.display = 'flex';
                return; 
            }

            const newRes = { name, category, provider, guests, datetime: dateTime, status: "Pending" };
            const allRes = JSON.parse(localStorage.getItem("hawaleek_reservations")) || [];
            allRes.push(newRes);
            localStorage.setItem("hawaleek_reservations", JSON.stringify(allRes));

            this.reset();
            renderTable(filter ? filter.value : "All");
        });
    }

    // 4. CONFIRM / CANCEL BUTTON LOGIC
    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;

            const realIndex = row.getAttribute('data-index');
            const allRes = JSON.parse(localStorage.getItem("hawaleek_reservations")) || [];

            if (target.classList.contains('btn-confirm')) {
                allRes[realIndex].status = "Confirmed";
                localStorage.setItem("hawaleek_reservations", JSON.stringify(allRes));
                renderTable(filter ? filter.value : "All");
            }

            if (target.classList.contains('btn-cancel')) {
                allRes[realIndex].status = "Cancelled";
                localStorage.setItem("hawaleek_reservations", JSON.stringify(allRes));
                renderTable(filter ? filter.value : "All");
            }
        });
    }

    if (filter) {
        filter.addEventListener('change', (e) => renderTable(e.target.value));
    }

    renderTable();
});