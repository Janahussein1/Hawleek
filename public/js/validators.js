// Client-side validators for common form fields
document.addEventListener('DOMContentLoaded', () => {
  const nameRegex = /^[\p{L} ]+$/u; // letters and spaces only
  const emailRegex = /^\S+@\S+\.\S+$/;
  // phones: optional leading +, digits, spaces or dashes, 7-20 chars total (no letters)
  const phoneRegex = /^\+?[0-9\s\-]{7,20}$/;
  const addressRegex = /^[\p{L}0-9\s\.,#\-]+$/u; // letters, numbers, basic punctuation
  const placeNameRegex = /^[\p{L}0-9\s\.,&'\-]+$/u;

  function showMsg(msg) {
    if (typeof showToast === 'function') {
      showToast(msg, 'error');
    } else {
      alert(msg);
    }
  }

  function validateInput(el) {
    if (!el) return true;
    const val = (el.value || '').trim();
    const id = el.id || '';
    const type = el.type || el.nodeName.toLowerCase();

    if (el.hasAttribute('required') && !val) {
      showMsg('Please fill in the required field.');
      el.focus();
      return false;
    }

    if (/name/i.test(id) && val) {
      if (!nameRegex.test(val)) { showMsg('Name must contain letters and spaces only.'); el.focus(); return false; }
    }

    if (/email/i.test(id) && val) {
      if (!emailRegex.test(val)) { showMsg('Please enter a valid email address.'); el.focus(); return false; }
    }

    if (/phone|tel|mobile|contact|reservation-phone/i.test(id) && val) {
      if (!phoneRegex.test(val)) { showMsg('Phone must contain only digits (optional leading +, spaces or dashes).'); el.focus(); return false; }
    }

    // Route/destination fields must be names (no numeric-only values)
    if (/route|destination|line|route-name/i.test(id) && val) {
      if (!nameRegex.test(val)) { showMsg('Route/destination must contain letters and spaces only.'); el.focus(); return false; }
    }

    if (/address|addr/i.test(id) && val) {
      if (!addressRegex.test(val)) { showMsg('Address contains invalid characters.'); el.focus(); return false; }
    }

    if (/place[-_ ]?name|business[-_ ]?name/i.test(id) && val) {
      if (!placeNameRegex.test(val)) { showMsg('Place name contains invalid characters.'); el.focus(); return false; }
    }

    if (/password|pass/i.test(id) && val) {
      if (val.length > 0 && val.length < 6) { showMsg('Password must be at least 6 characters.'); el.focus(); return false; }
    }

    return true;
  }

  function validateForm(form) {
    if (!form) return true;
    // Validate required fields and known inputs
    const inputs = Array.from(form.querySelectorAll('input, textarea, select'));
    for (const el of inputs) {
      // Skip disabled fields
      if (el.disabled) continue;
      // For file inputs, just ensure required is satisfied
      if (el.type === 'file' && el.required) {
        if (!el.files || el.files.length === 0) { showMsg('Please upload the required file.'); el.focus(); return false; }
        continue;
      }
      if (!validateInput(el)) return false;
    }

    // Additional cross-field checks (password confirmation)
    const pass = form.querySelector('input[id*="password"]');
    const confirm = form.querySelector('input[id*="confirm"]');
    if (pass && confirm) {
      if ((pass.value || '') !== (confirm.value || '')) { showMsg('Passwords do not match.'); confirm.focus(); return false; }
    }

    return true;
  }

  // Validate every form submit across the page
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form && form.nodeName === 'FORM') {
      if (!validateForm(form)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    }
  }, true);

  // For any input that appears to be a name field, sanitize typing to remove digits
  function attachNameSanitizer(el) {
    if (!el) return;
    el.addEventListener('input', () => {
      const before = el.value;
      // remove digits and common symbols not allowed in names
      const cleaned = before.replace(/[0-9_@<>\/\[\]$%*+=~`|]/g, '');
      if (cleaned !== before) {
        const pos = el.selectionStart - (before.length - cleaned.length);
        el.value = cleaned;
        try { el.setSelectionRange(pos, pos); } catch (e) {}
      }
    });

    // Prevent pasting numbers-heavy content
    el.addEventListener('paste', (ev) => {
      const text = (ev.clipboardData || window.clipboardData).getData('text') || '';
      if (/[0-9]/.test(text)) {
        ev.preventDefault();
        const cleaned = text.replace(/[0-9_@<>\/\[\]$%*+=~`|]/g, '');
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const val = el.value;
        el.value = val.slice(0, start) + cleaned + val.slice(end);
      }
    });
  }

  // Attach appropriate sanitizers/handlers to inputs based on role
  function attachInputHandlers(el) {
    if (!el || el._validatorsAttached) return;
    el._validatorsAttached = true;

    const idOrName = (el.id || el.name || '').toLowerCase();
    const type = (el.type || el.nodeName || '').toLowerCase();

    // Name-like fields
    if (/\bname\b/.test(idOrName) || /full[-_ ]?name/.test(idOrName) || /avatar-display-name/.test(idOrName)) {
      attachNameSanitizer(el);
    }

    // Phone-like fields
    if (/phone|tel|mobile|contact|reservation-phone/.test(idOrName) || type === 'tel') {
      // allow digits, +, spaces, dashes
      el.addEventListener('input', () => {
        const before = el.value || '';
        const cleaned = before.replace(/[^0-9\s\-\+]/g, '');
        if (cleaned !== before) {
          const pos = (el.selectionStart || 0) - (before.length - cleaned.length);
          el.value = cleaned;
          try { el.setSelectionRange(pos, pos); } catch (e) {}
        }
      });
      el.addEventListener('paste', (ev) => {
        const text = (ev.clipboardData || window.clipboardData).getData('text') || '';
        if (/[^0-9\s\-\+]/.test(text)) {
          ev.preventDefault();
          const cleaned = text.replace(/[^0-9\s\-\+]/g, '');
          const start = el.selectionStart || 0;
          const end = el.selectionEnd || 0;
          const val = el.value || '';
          el.value = val.slice(0, start) + cleaned + val.slice(end);
        }
      });
    }

    // Route/destination fields: ensure letters/spaces only
    if (/route|destination|line|route-name/.test(idOrName)) {
      attachNameSanitizer(el);
    }

    // For inputs of type number, enforce min/max attributes if present via native behavior
    // For others, no-op here — validation will run on submit
  }

  // Attach handlers to existing inputs
  Array.from(document.querySelectorAll('input, textarea, select')).forEach(attachInputHandlers);

  // Observe DOM for dynamic inputs/forms and attach handlers
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of Array.from(m.addedNodes || [])) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches && (node.matches('input') || node.matches('textarea') || node.matches('select'))) {
          attachInputHandlers(node);
        }
        // also search inside the node for inputs
        const found = node.querySelectorAll && node.querySelectorAll('input, textarea, select');
        if (found && found.length) Array.from(found).forEach(attachInputHandlers);
      }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // Delegate: catch dynamic booking/reservation forms if added later
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form && form.nodeName === 'FORM' && !formIds.includes(form.id)) {
      if (!validateForm(form)) e.preventDefault();
    }
  }, true);
});
