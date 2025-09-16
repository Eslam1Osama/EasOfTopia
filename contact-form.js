// Contact Form Modal Logic

document.addEventListener('DOMContentLoaded', () => {
  // Modal open/close logic
  const contactModal = document.getElementById('contact-modal');
  const contactModalClose = document.getElementById('contact-modal-close');
  const contactButton = document.querySelector('a.nav-link[href="#contact"]');
  const footerContactButton = document.querySelector('footer a.footer-link[href="#contact"]');
  let lastActiveElement = null;

  function openContactModal() {
    lastActiveElement = document.activeElement;
    contactModal.classList.add('opacity-100');
    contactModal.classList.remove('opacity-0', 'pointer-events-none');
    contactModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      contactModal.querySelector('input, textarea, button').focus();
    }, 200);
    document.body.style.overflow = '';
  }
  function closeContactModal() {
    contactModal.classList.remove('opacity-100');
    contactModal.classList.add('opacity-0', 'pointer-events-none');
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastActiveElement) lastActiveElement.focus();
  }
  if (contactButton) {
    contactButton.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal();
    });
  }
  
  // Footer contact button modal functionality
  if (footerContactButton) {
    footerContactButton.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal();
    });
  }
  if (contactModalClose) {
    contactModalClose.addEventListener('click', closeContactModal);
  }
  // Remove overlay click to close (only close button or Escape)
  // contactModal.addEventListener('mousedown', (e) => {
  //   if (e.target === contactModal) closeContactModal();
  // });
  document.addEventListener('keydown', (e) => {
    if (contactModal.classList.contains('opacity-100') && (e.key === 'Escape')) {
      closeContactModal();
    }
  });
  // Trap focus in modal
  contactModal.addEventListener('keydown', (e) => {
    if (!contactModal.classList.contains('opacity-100')) return;
    if (e.key !== 'Tab') return;
    const focusableEls = contactModal.querySelectorAll('input, textarea, button');
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  });

  // --- Contact Form Logic ---
  const contactForm = document.getElementById('contact-form');
  // Update access_key value
  const accessKeyInput = contactForm.querySelector('input[name="access_key"]');
  if (accessKeyInput) {
    accessKeyInput.value = '3007df70-0d51-41ac-b89a-c76cfc90f071';
  }
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const submitButton = document.getElementById('submit-button');
  const formMessage = document.getElementById('form-message');
  const errorName = document.getElementById('error-name');
  const errorEmail = document.getElementById('error-email');
  const errorMessage = document.getElementById('error-message');
  const helpName = document.getElementById('help-name');
  const helpEmail = document.getElementById('help-email');
  const helpMessage = document.getElementById('help-message');
  let justSubmitted = false;
  let submissionSuccess = false;

  // --- Validation Functions ---
  function validateName(showError = false) {
    const value = nameInput.value.trim();
    if (!value) {
      errorName.textContent = '';
      errorName.classList.remove('active');
      helpName.style.display = 'block';
      return false;
    }
    if (value.length < 2) {
      if (showError) showFieldError(errorName, helpName, 'Name must be at least 2 characters.');
      return false;
    }
    if (value.length > 50) {
      if (showError) showFieldError(errorName, helpName, 'Name is too long. Max 50 characters.');
      return false;
    }
    if (/[^a-zA-Z\s]/.test(value)) {
      if (showError) showFieldError(errorName, helpName, 'Name must only contain letters and spaces.');
      return false;
    }
    errorName.textContent = '';
    errorName.classList.remove('active');
    helpName.style.display = 'block';
    return true;
  }
  function validateEmail(showError = false) {
    const value = emailInput.value.trim();
    if (!value) {
      errorEmail.textContent = '';
      errorEmail.classList.remove('active');
      helpEmail.style.display = 'block';
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      if (showError) showFieldError(errorEmail, helpEmail, 'Please enter a valid email address.');
      return false;
    }
    if (value.length > 100) {
      if (showError) showFieldError(errorEmail, helpEmail, 'Email is too long. Max 100 characters.');
      return false;
    }
    errorEmail.textContent = '';
    errorEmail.classList.remove('active');
    helpEmail.style.display = 'block';
    return true;
  }
  function validateMessage(showError = false) {
    const value = messageInput.value.trim();
    if (!value) {
      errorMessage.textContent = '';
      errorMessage.classList.remove('active');
      helpMessage.style.display = 'block';
      return false;
    }
    if (value.length < 10) {
      if (showError) showFieldError(errorMessage, helpMessage, 'Message must be at least 10 characters.');
      return false;
    }
    if (value.length > 1000) {
      if (showError) showFieldError(errorMessage, helpMessage, 'Message is too long. Max 1000 characters.');
      return false;
    }
    errorMessage.textContent = '';
    errorMessage.classList.remove('active');
    helpMessage.style.display = 'block';
    return true;
  }
  function showFieldError(errorEl, helpEl, msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('active');
    helpEl.style.display = 'none';
  }
  function hideFieldError(errorEl, helpEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('active');
    helpEl.style.display = 'block';
  }
  // --- Button State Logic ---
  function updateSubmitState() {
    if (justSubmitted) {
      submitButton.disabled = true;
      submitButton.classList.add('disabled');
      return;
    }
    const validName = validateName(false);
    const validEmail = validateEmail(false);
    const validMessage = validateMessage(false);
    const allFilled = nameInput.value.trim() && emailInput.value.trim() && messageInput.value.trim();
    if (validName && validEmail && validMessage && allFilled) {
      submitButton.disabled = false;
      submitButton.classList.remove('disabled');
    } else {
      submitButton.disabled = true;
      submitButton.classList.add('disabled');
    }
  }
  // --- Event Listeners ---
  // Show help on focus
  nameInput.addEventListener('focus', () => helpName.style.display = 'block');
  nameInput.addEventListener('blur', () => { helpName.style.display = 'none'; validateName(true); updateSubmitState(); });
  emailInput.addEventListener('focus', () => helpEmail.style.display = 'block');
  emailInput.addEventListener('blur', () => { helpEmail.style.display = 'none'; validateEmail(true); updateSubmitState(); });
  messageInput.addEventListener('focus', () => helpMessage.style.display = 'block');
  messageInput.addEventListener('blur', () => { helpMessage.style.display = 'none'; validateMessage(true); updateSubmitState(); });
  // Validate on input
  nameInput.addEventListener('input', () => { justSubmitted = false; validateName(false); updateSubmitState(); });
  emailInput.addEventListener('input', () => { justSubmitted = false; validateEmail(false); updateSubmitState(); });
  messageInput.addEventListener('input', () => { justSubmitted = false; validateMessage(false); updateSubmitState(); });
  // Initial state
  updateSubmitState();
  // --- Form Submission Handler ---
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const validName = validateName(true);
    const validEmail = validateEmail(true);
    const validMessage = validateMessage(true);
    if (!(validName && validEmail && validMessage)) {
      updateSubmitState();
      return false;
    }
    submitButton.disabled = true;
    submitButton.classList.add('disabled');
    justSubmitted = true;
    formMessage.classList.remove('success', 'error', 'show');
    // Prepare data for async send
    const formData = new FormData(contactForm);
    const object = {};
    formData.forEach((value, key) => { object[key] = value; });
    const json = JSON.stringify(object);
    // Show sending state
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    Array.from(contactForm.elements).forEach(input => {
      if (input.type !== 'hidden') input.disabled = true;
    });
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });
      const result = await response.json();
      if (result.success) {
        formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully.';
        formMessage.classList.add('success', 'show');
        contactForm.reset();
        submitButton.innerHTML = '<i class="fas fa-check"></i> Sent!';
        submitButton.style.backgroundColor = '#28a745';
        setTimeout(() => {
          submitButton.innerHTML = 'Send Message';
          submitButton.style.backgroundColor = '';
        }, 3000);
        submitButton.disabled = true;
        // Show all helper texts after reset
        if (typeof helpName !== 'undefined') helpName.style.display = 'block';
        if (typeof helpEmail !== 'undefined') helpEmail.style.display = 'block';
        if (typeof helpMessage !== 'undefined') helpMessage.style.display = 'block';
        submissionSuccess = true;
        justSubmitted = true;
      } else {
        formMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${result.message}`;
        formMessage.classList.add('error', 'show');
        submissionSuccess = false;
      }
    } catch (error) {
      formMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> An error occurred. Please try again later.';
      formMessage.classList.add('error', 'show');
      submissionSuccess = false;
    } finally {
      Array.from(contactForm.elements).forEach(input => {
        if (input.type !== 'hidden') input.disabled = false;
      });
      if (!submissionSuccess) {
        submitButton.innerHTML = 'Send Message';
        submitButton.disabled = false;
        submitButton.classList.remove('disabled');
      }
      setTimeout(() => {
        formMessage.classList.remove('show');
        formMessage.innerHTML = '';
      }, 5000);
    }
  });

  // Also open modal from mobile menu Contact link
  const mobileContactLink = document.querySelector('#mobile-menu a[href="#contact"]');
  if (mobileContactLink) {
    mobileContactLink.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal();
      // Also close the mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && mobileMenu.classList.contains('translate-x-0')) {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        if (mobileMenuOverlay) {
          mobileMenuOverlay.classList.remove('opacity-100', 'pointer-events-auto');
          mobileMenuOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
      }
    });
  }
}); 