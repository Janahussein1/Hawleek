document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LOCAL STORAGE (State Management) ---
    // Retrieve saved stats or use defaults if it's the first time
    let pendingCount = localStorage.getItem('pendingStats') ? parseInt(localStorage.getItem('pendingStats')) : 12;
    let cancelledCount = localStorage.getItem('cancelledStats') ? parseInt(localStorage.getItem('cancelledStats')) : 4;

    const statPendingEl = document.getElementById('stat-pending');
    const statCancelledEl = document.getElementById('stat-cancelled');

    // Set initial UI
    statPendingEl.innerText = pendingCount;
    statCancelledEl.innerText = cancelledCount;

    // Function to update the DOM and save to LocalStorage simultaneously
    const updateStats = () => {
        statPendingEl.innerText = pendingCount;
        statCancelledEl.innerText = cancelledCount;
        localStorage.setItem('pendingStats', pendingCount);
        localStorage.setItem('cancelledStats', cancelledCount);
    };

    // --- 2. THE DIALOG MODAL SYSTEM ---
    const modal = document.getElementById('notificationModal');
    const modalText = modal.querySelector('p');

    // Helper function to show a custom message in our native modal
    const showNotification = (message) => {
        modalText.innerText = message;
        modal.showModal(); // This is the built-in HTML5 function to open a <dialog>
    };

    // --- 3. EVENT DELEGATION & DATA ATTRIBUTES ---
    const tableBody = document.getElementById('reservation-table-body');

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;

            // ADVANCED: Reading custom data attributes using the JavaScript 'dataset' API
            const reservationId = row.dataset.id; 
            const currentStatus = row.dataset.status; 
            const customerName = row.querySelector('.customer-name').innerText;

            const badge = row.querySelector('.badge');
            const confirmBtn = row.querySelector('.btn-confirm');
            const cancelBtn = row.querySelector('.btn-cancel');

            // --- HANDLE CONFIRM ---
            if (target.classList.contains('btn-confirm') && !target.disabled) {
                if (currentStatus === 'pending') {
                    pendingCount--; // Decrease pending
                }
                
                // Update UI visually
                badge.className = 'badge confirmed';
                badge.textContent = 'Confirmed';
                target.disabled = true; 
                
                // ADVANCED: Update the hidden data attribute
                row.dataset.status = 'confirmed';

                updateStats(); 
                
                // ADVANCED: ES6 Template Literals (` `) to insert variables into a string
                showNotification(`Reservation #${reservationId} for ${customerName} has been Confirmed.`);
            }

            // --- HANDLE CANCEL ---
            if (target.classList.contains('btn-cancel') && !target.disabled) {
                if (currentStatus === 'pending') {
                    pendingCount--; 
                }
                
                cancelledCount++; 
                
                badge.className = 'badge cancelled';
                badge.textContent = 'Cancelled';
                
                confirmBtn.disabled = true;
                cancelBtn.disabled = true;
                row.style.opacity = '0.5'; 
                
                // ADVANCED: Update the hidden data attribute
                row.dataset.status = 'cancelled';

                updateStats(); 
                
                showNotification(`Reservation #${reservationId} for ${customerName} has been Cancelled.`);
            }
        });
    }

    // --- 4. REGULAR EXPRESSIONS (Live Search Filter) ---
    const searchInput = document.getElementById('searchInput');
    const rows = document.querySelectorAll('.reservation-row');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();

        // Create a Dynamic Regular Expression ('i' = case insensitive)
        const regexPattern = new RegExp(searchTerm, 'i');

        rows.forEach(row => {
            const customerName = row.querySelector('.customer-name').textContent;
            
            // Regex .test() checks if the pattern exists in the string
            if (regexPattern.test(customerName)) {
                row.classList.remove('hidden-row');
            } else {
                row.classList.add('hidden-row');
            }
        });
    });
});
