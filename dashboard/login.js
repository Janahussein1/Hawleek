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
            <h3>Login Error</h3>
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

    const loginForm = document.getElementById('adminLoginForm');

    if (loginForm) {
        loginForm.setAttribute('novalidate', 'true');

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const userInput = document.getElementById('adminUser').value.trim();
            const passInput = document.getElementById('adminPass').value.trim();

            if (userInput !== 'admin' || passInput !== 'adminpass12') {
                modalText.innerHTML = "<b>❌ Invalid Credentials:</b> The username or password you entered is incorrect.";
                modalOverlay.style.display = 'flex';
                return;
            }

            window.location.href = 'dashboard.html';
        });
    }
});