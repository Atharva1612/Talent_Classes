/**
 * Talent Classes - Main Frontend Script
 * Configured with GSAP & ScrollTrigger for continuous bi-directional scroll animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initDynamicYear();
    initSmoothScroll();
    initScrollSpy();
    initGsapAnimations(); // Bi-directional scroll animations
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
   2. Smooth Scrolling with Dynamic Header Offset
   ========================================================================== */
function initSmoothScroll() {
    const header = document.querySelector('.site-header');
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            event.preventDefault();

            const headerHeight = header ? header.offsetHeight : 70;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            if (link.classList.contains('nav-link')) {
                setActiveNavLink(targetId);
            }
        });
    });
}

/* ==========================================================================
   3. Active Navigation State (Scroll-Spy)
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('main section[id]');
    if (!sections.length) return;

    const observerOptions = {
        root: null,
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

    window.addEventListener('scroll', () => {
        const scrolledToBottom =
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;

        if (scrolledToBottom) {
            setActiveNavLink('#contact');
        }
    }, { passive: true });
}

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
   4. Bi-Directional GSAP & ScrollTrigger Animations
   ========================================================================== */
function initGsapAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Hero Section (Re-animates when scrolling back up to top) ---
    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.hero-section',
            start: 'top 80%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse'
        },
        defaults: { ease: 'power3.out', duration: 0.8 }
    });

    heroTl.from('.eyebrow-badge', { opacity: 0, y: 18 })
        .from('.hero-title', { opacity: 0, y: 22 }, '-=0.55')
        .from('.hero-subtitle', { opacity: 0, y: 18 }, '-=0.6')
        .from('.hero-actions .btn', { opacity: 0, y: 15, stagger: 0.1 }, '-=0.55')
        .from('.hero-trust-notes .trust-item', { opacity: 0, y: 12, stagger: 0.1 }, '-=0.5');

    // --- 2. Section Headers (Animate on enter & reverse on leave) ---
    gsap.utils.toArray('.section-header').forEach((header) => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 88%',
                end: 'bottom 12%',
                toggleActions: 'play reverse play reverse'
            },
            opacity: 0,
            y: 24,
            duration: 0.75,
            ease: 'power2.out'
        });
    });

    // --- 3. Enhanced About Section (Bi-Directional Staggered Sequence) ---
    const aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 82%',
            end: 'bottom 16%',
            toggleActions: 'play reverse play reverse'
        },
        defaults: { ease: 'power3.out' }
    });

    // 1. Portrait expands into view
    aboutTl.from('.teacher-portrait', {
        opacity: 0,
        scale: 0.88,
        duration: 0.8
    })
        // 2. Experience card badge pops up with an elastic overshoot bounce
        .from('.experience-card', {
            opacity: 0,
            y: 28,
            scale: 0.85,
            duration: 0.7,
            ease: 'back.out(1.8)'
        }, '-=0.45')
        // 3. Section Tag ("About the Educator") slides from left
        .from('.about-content .section-tag', {
            opacity: 0,
            x: -24,
            duration: 0.6
        }, '-=0.5')
        // 4. Heading glides up
        .from('.about-content .section-heading', {
            opacity: 0,
            y: 22,
            duration: 0.7
        }, '-=0.45')
        // 5. Teacher quote & lead paragraph fade in
        .from('.about-lead', {
            opacity: 0,
            x: -18,
            duration: 0.65
        }, '-=0.4')
        .from('.about-text', {
            opacity: 0,
            y: 18,
            stagger: 0.12,
            duration: 0.65
        }, '-=0.4')
        // 6. The two pillar cards glide up
        .from('.pillar-box', {
            opacity: 0,
            y: 25,
            stagger: 0.15,
            duration: 0.7
        }, '-=0.35')
        // 7. Pillar icons pop in with a playful spin
        .from('.pillar-icon', {
            scale: 0,
            rotation: -25,
            stagger: 0.15,
            duration: 0.5,
            ease: 'back.out(2)'
        }, '-=0.45');

    // --- 4. Feature Cards: Each card animates independently on scroll up & down ---
    gsap.utils.toArray('.feature-card').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                end: 'bottom 10%',
                toggleActions: 'play reverse play reverse'
            },
            opacity: 0,
            y: 28,
            duration: 0.65,
            ease: 'power2.out'
        });
    });

    // --- 5. Contact Section: Form & Info Columns ---
    const isMobile = window.innerWidth < 768;

    gsap.from('.contact-form-card', {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 82%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse'
        },
        opacity: 0,
        x: isMobile ? 0 : -25,
        y: isMobile ? 25 : 0,
        duration: 0.8,
        ease: 'power3.out'
    });

    gsap.from('.contact-info-wrapper', {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 82%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse'
        },
        opacity: 0,
        x: isMobile ? 0 : 25,
        y: isMobile ? 25 : 0,
        duration: 0.8,
        ease: 'power3.out'
    });
}

/* ==========================================================================
   5. Contact Form Validation & Formspree Submission
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
        name: {
            input: document.getElementById('fullName'),
            errorEl: document.getElementById('nameError'),
            validate: (val) => {
                const trimmed = (val || '').trim();
                if (!trimmed) return 'Please enter the parent or student name.';
                if (trimmed.length < 2) return 'Name must be at least 2 characters long.';
                return '';
            }
        },
        email: {
            input: document.getElementById('emailAddress'),
            errorEl: document.getElementById('emailError'),
            validate: (val) => {
                const trimmed = (val || '').trim();
                if (!trimmed) return 'Please enter an email address.';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
                return '';
            }
        },
        phone: {
            input: document.getElementById('phoneNumber'),
            errorEl: document.getElementById('phoneError'),
            validate: (val) => {
                const trimmed = (val || '').trim();
                if (!trimmed) return 'Please enter a phone or WhatsApp number.';

                let digits = trimmed.replace(/\D/g, '');

                if (digits.length === 12 && digits.startsWith('91')) {
                    digits = digits.slice(2);
                } else if (digits.length === 11 && digits.startsWith('0')) {
                    digits = digits.slice(1);
                }

                const isValidIndianMobile = /^[6-9]\d{9}$/.test(digits);
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
                const trimmed = (val || '').trim();
                if (!trimmed) return 'Please share the student’s class and learning requirements.';
                if (trimmed.length < 10) return 'Please provide a few more details (at least 10 characters).';
                return '';
            }
        }
    };

    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    Object.values(fields).forEach(({ input, errorEl, validate }) => {
        if (!input) return;

        input.addEventListener('input', () => {
            if (input.classList.contains('input-error')) {
                setFieldState(input, errorEl, '');
            }
            clearFormStatus(formStatus);
        });

        input.addEventListener('blur', () => {
            const errorMessage = validate(input.value);
            setFieldState(input, errorEl, errorMessage);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormStatus(formStatus);

        let isFormValid = true;
        let firstInvalidInput = null;

        Object.values(fields).forEach(({ input, errorEl, validate }) => {
            if (!input) return;
            const errorMessage = validate(input.value);
            setFieldState(input, errorEl, errorMessage);

            if (errorMessage) {
                isFormValid = false;
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
            }
        });

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

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending Inquiry...</span> <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';

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
                    : 'Oops! There was a problem submitting your inquiry. Please try again or message us directly on WhatsApp.';
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

function showFormStatus(statusEl, type, message) {
    if (!statusEl) return;
    statusEl.className = `form-status ${type}`;
    statusEl.textContent = message;
}

function clearFormStatus(statusEl) {
    if (!statusEl) return;
    statusEl.className = 'form-status';
    statusEl.textContent = '';
}