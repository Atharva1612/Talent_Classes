/**
 * Talent Classes - Main Frontend Script
 * Handles:
 * 1. Smooth Scrolling with Sticky Header Offset
 * 2. Active Navigation State (Scroll-Spy for Mobile Bottom Bar & Desktop Nav)
 * 3. Client-Side Form Validation & Formspree AJAX Submission
 * 4. Dynamic Footer Year
 */

document.addEventListener('DOMContentLoaded', () => {
    initDynamicYear();
    initSmoothScroll();
    initScrollSpy();
    initContactForm();
});

/* ==========================================================================
   1. Dynamic Copyright Year
   ========================================================================== */
function initDynamicYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

/* ==========================================================================
   2. Smooth Scrolling with Sticky Header Offset
   ========================================================================== */
function initSmoothScroll() {
    const header = document.querySelector('.site-header');
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');

            // Ignore empty hashes
            if (!targetId || targetId === '#') return;

            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            event.preventDefault();

            // Calculate header height dynamically for accurate scroll offset
            const headerHeight = header ? header.offsetHeight : 72;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Immediately update active state if a primary nav link was clicked
            if (link.classList.contains('nav-link')) {
                setActiveNavLink(targetId);
            }
        });
    });
}

/* ==========================================================================
   3. Active Section Highlighting (Scroll-Spy)
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('main section[id]');
    if (!sections.length) return;

    const observerOptions = {
        root: null,
        // Triggers when a section crosses the upper-middle portion of the viewport
        rootMargin: '-25% 0px -55% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const activeId = `#${entry.target.getAttribute('id')}`;
                setActiveNavLink(activeId);
            }
        });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));

    // Edge case: Highlight the final section ('#contact') when scrolled to the very bottom
    window.addEventListener('scroll', () => {
        const scrolledToBottom =
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;

        if (scrolledToBottom) {
            setActiveNavLink('#contact');
        }
    }, { passive: true });
}

/**
 * Updates the `.active` class and `aria-current` attribute across navigation links
 * @param {string} targetHash - e.g., '#home', '#about', '#features', '#contact'
 */
function setActiveNavLink(targetHash) {
    const navLinks = document.querySelectorAll('.main-nav .nav-link');

    navLinks.forEach((link) => {
        const isMatch = link.getAttribute('href') === targetHash;
        link.classList.toggle('active', isMatch);

        if (isMatch) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

/* ==========================================================================
   4. Contact Form Validation & Formspree Handling
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
        name: {
            input: document.getElementById('fullName'),
            errorEl: document.getElementById('nameError'),
            validate: (val) => {
                if (!val) return 'Please enter the parent or student name.';
                if (val.length < 2) return 'Name must be at least 2 characters long.';
                return '';
            }
        },
        email: {
            input: document.getElementById('emailAddress'),
            errorEl: document.getElementById('emailError'),
            validate: (val) => {
                if (!val) return 'Please enter an email address.';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                if (!emailRegex.test(val)) return 'Please enter a valid email address (e.g., name@email.com).';
                return '';
            }
        },
phone: {
            input: document.getElementById('phoneNumber'),
            errorEl: document.getElementById('phoneError'),
            validate: (val) => {
                if (!val || !val.trim()) {
                    return 'Please enter a phone or WhatsApp number.';
                }

                // 1. Strip all non-digit characters (removes +, spaces, hyphens, and hidden unicode)
                let digits = val.replace(/\D/g, '');

                // 2. Normalize Indian country code prefixes (+91 or leading 0)
                if (digits.length === 12 && digits.startsWith('91')) {
                    digits = digits.slice(2);
                } else if (digits.length === 11 && digits.startsWith('0')) {
                    digits = digits.slice(1);
                }

                // 3. Check for standard 10-digit mobile number (starting with 6, 7, 8, or 9)
                const isValidIndianMobile = /^[6-9]\d{9}$/.test(digits);
                
                // Flexible check for general 10 to 15 digit international numbers
                const isValidInternational = digits.length >= 10 && digits.length <= 15;

                if (!isValidIndianMobile && !isValidInternational) {
                    return 'Please enter a valid 10-digit mobile number.';
                }

                return '';
            }
        },
        message: {
            input: document.getElementById('studentMessage'),
            errorEl: document.getElementById('messageError'),
            validate: (val) => {
                if (!val) return 'Please share the student’s class and learning requirements.';
                if (val.length < 10) return 'Please provide a few more details (at least 10 characters).';
                return '';
            }
        }
    };

    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    // Attach real-time validation listeners to clear errors as user types
    Object.values(fields).forEach(({ input, errorEl, validate }) => {
        if (!input) return;

        input.addEventListener('input', () => {
            if (input.classList.contains('input-error')) {
                const errorMessage = validate(input.value.trim());
                setFieldState(input, errorEl, errorMessage);
            }
            // Clear global status banner when user starts editing again
            clearFormStatus(formStatus);
        });

        input.addEventListener('blur', () => {
            const errorMessage = validate(input.value.trim());
            setFieldState(input, errorEl, errorMessage);
        });
    });

    // Form Submit Handler
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormStatus(formStatus);

        let isFormValid = true;
        let firstInvalidInput = null;

        // Validate all fields
        Object.values(fields).forEach(({ input, errorEl, validate }) => {
            if (!input) return;
            const value = input.value.trim();
            const errorMessage = validate(value);

            setFieldState(input, errorEl, errorMessage);

            if (errorMessage) {
                isFormValid = false;
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
            }
        });

        // Stop and focus the first problematic field if validation fails
        if (!isFormValid) {
            if (firstInvalidInput) {
                firstInvalidInput.focus();
            }
            showFormStatus(
                formStatus,
                'error',
                'Please check the highlighted fields above before sending your inquiry.'
            );
            return;
        }

        const endpoint = form.getAttribute('action') || '';
        const originalBtnHTML = submitBtn.innerHTML;

        // Set button loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending Inquiry...</span> <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';

        // Check if Formspree placeholder ID hasn't been replaced yet (local preview safeguard)
        if (endpoint.includes('YOUR_FORM_ID')) {
            setTimeout(() => {
                showFormStatus(
                    formStatus,
                    'success',
                    'Thank you! Your inquiry has been validated. (Note: Replace "YOUR_FORM_ID" in index.html with your live Formspree ID to receive emails).'
                );
                form.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
            }, 600);
            return;
        }

        // Live Formspree Submission via Fetch API
        try {
            const formData = new FormData(form);
            const response = await fetch(endpoint, {
                method: form.getAttribute('method') || 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showFormStatus(
                    formStatus,
                    'success',
                    'Thank you for reaching out! Varsha Ma’am will review your message and contact you shortly.'
                );
                form.reset();
            } else {
                const data = await response.json().catch(() => ({}));
                const serverError = data.errors
                    ? data.errors.map((err) => err.message).join(', ')
                    : 'Oops! There was a problem submitting your inquiry. Please try again or message us on WhatsApp.';
                showFormStatus(formStatus, 'error', serverError);
            }
        } catch (error) {
            showFormStatus(
                formStatus,
                'error',
                'Network error: Unable to send message right now. Please reach out directly via phone or WhatsApp.'
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });
}

/**
 * Sets or clears error styling and message on an individual form field
 */
function setFieldState(input, errorEl, errorMessage) {
    if (errorMessage) {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = errorMessage;
    } else {
        input.classList.remove('input-error');
        input.setAttribute('aria-invalid', 'false');
        if (errorEl) errorEl.textContent = '';
    }
}

/**
 * Displays the form status banner (success or error)
 */
function showFormStatus(statusEl, type, message) {
    if (!statusEl) return;
    statusEl.className = `form-status ${type}`;
    statusEl.textContent = message;
}

/**
 * Hides and resets the form status banner
 */
function clearFormStatus(statusEl) {
    if (!statusEl) return;
    statusEl.className = 'form-status';
    statusEl.textContent = '';
}