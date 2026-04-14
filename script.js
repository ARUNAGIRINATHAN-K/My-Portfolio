/* ==========================================================================
   RETROFUTURISTIC PORTFOLIO — MAIN SCRIPT
   Magnetic cursor, physics nav, Intersection Observer, parallax, typewriter
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';




    // ── NAVBAR SCROLL STATE ──
    const navbar = document.getElementById('navbar');
    let lastScrollY = 0;

    function updateNavbar() {
        const scrollY = window.scrollY;
        if (navbar) {
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        lastScrollY = scrollY;
    }

    // ── ACTIVE NAV LINK on scroll ──
    const sections = document.querySelectorAll('.section[id]');
    const navItems = document.querySelectorAll('.nav-item[data-section]');

    function updateActiveNav() {
        const scrollY = window.scrollY + window.innerHeight / 3;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.id;

            if (scrollY >= top && scrollY < top + height) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.dataset.section === id) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    // ── SMOOTH SCROLL for nav links ──
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offset = targetSection.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
                window.scrollTo({
                    top: offset,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                });
            }
            // Close mobile menu
            closeMobileMenu();
        });
    });

    // ── HAMBURGER MOBILE MENU ──
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('nav-links');

    function openMobileMenu() {
        navLinksContainer?.classList.add('active');
        hamburger?.classList.add('active');
        hamburger?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        navLinksContainer?.classList.remove('active');
        hamburger?.classList.remove('active');
        hamburger?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    hamburger?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navLinksContainer?.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });

    document.addEventListener('click', (e) => {
        if (navLinksContainer?.classList.contains('active') &&
            !navLinksContainer.contains(e.target) &&
            !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // ── GAMIFIED PHYSICS NAVIGATION ──
    const physicsNavItems = document.querySelectorAll('.nav-item[data-section]');
    const springConfig = { stiffness: 0.08, damping: 0.7 };

    physicsNavItems.forEach(item => {
        let velocity = 0;
        let displacement = 0;
        let isAnimating = false;

        item.addEventListener('mouseenter', () => {
            velocity = -3; // Initial kick
            if (!isAnimating) {
                isAnimating = true;
                animateSpring();
            }

            // Repel neighbors
            const parent = item.closest('li');
            const prevLi = parent?.previousElementSibling;
            const nextLi = parent?.nextElementSibling;

            if (prevLi?.querySelector('.nav-item')) {
                prevLi.querySelector('.nav-item').style.transform = 'translateY(3px)';
                setTimeout(() => {
                    prevLi.querySelector('.nav-item').style.transform = '';
                }, 300);
            }
            if (nextLi?.querySelector('.nav-item')) {
                nextLi.querySelector('.nav-item').style.transform = 'translateY(3px)';
                setTimeout(() => {
                    nextLi.querySelector('.nav-item').style.transform = '';
                }, 300);
            }
        });

        item.addEventListener('mouseleave', () => {
            velocity = 2; // Snap back kick
        });

        function animateSpring() {
            const force = -springConfig.stiffness * displacement;
            velocity += force;
            velocity *= springConfig.damping;
            displacement += velocity;

            item.style.transform = `translateY(${displacement}px)`;

            if (Math.abs(velocity) > 0.05 || Math.abs(displacement) > 0.05) {
                requestAnimationFrame(animateSpring);
            } else {
                displacement = 0;
                velocity = 0;
                item.style.transform = '';
                isAnimating = false;
            }
        }
    });

    // ── INTERSECTION OBSERVER — ENTRY ANIMATIONS ──
    const animateElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt(el.dataset.delay) || 0;

                setTimeout(() => {
                    el.classList.add('animate-in');
                }, delay);

                observer.unobserve(el);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // ── PARALLAX HERO (requestAnimationFrame) ──
    const heroSection = document.querySelector('[data-parallax]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;

    function updateParallax() {
        if (heroSection && !prefersReducedMotion) {
            const scrollY = window.scrollY;
            const heroHeight = heroSection.offsetHeight;

            if (scrollY < heroHeight) {
                const heroContent = heroSection.querySelector('.hero-content');
                const heroVisual = heroSection.querySelector('.hero-visual');
                const scrollIndicator = heroSection.querySelector('.scroll-indicator');

                if (heroContent) {
                    heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
                    heroContent.style.opacity = 1 - (scrollY / heroHeight) * 0.6;
                }
                if (heroVisual) {
                    heroVisual.style.transform = `translateY(${scrollY * 0.25}px)`;
                }
                if (scrollIndicator) {
                    scrollIndicator.style.opacity = 1 - (scrollY / (heroHeight * 0.4));
                }
            }
        }
        ticking = false;
    }

    // ── SCROLL EVENT — Unified handler ──
    window.addEventListener('scroll', () => {
        updateNavbar();
        updateActiveNav();

        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });

    // Initial calls
    updateNavbar();
    updateActiveNav();

    // ── THEME TOGGLE ──
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle?.querySelector('i');
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle?.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);
        updateThemeIcon(next);
    });

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // ── TYPEWRITER EFFECT ──
    const phrases = [
        "Full Stack Developer.",
        "Data Scientist.",
        "MLOps Engineer.",
        "AI Practitioner.",
        "Open Source Contributor."
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typewriterEl = document.getElementById('typewriter');

    function typeLoop() {
        if (!typewriterEl) return;

        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        typewriterEl.textContent = currentPhrase.substring(0, charIndex);

        let speed = isDeleting ? 35 : 70;

        if (!isDeleting && charIndex === currentPhrase.length) {
            speed = 1800;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            speed = 400;
        }

        setTimeout(typeLoop, speed);
    }

    setTimeout(typeLoop, 800);

    // ── CONTACT FORM (Formspree AJAX) ──
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Sending...';
        }

        try {
            const formData = new FormData(contactForm);
            const res = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                contactForm.reset();
                showToast('Message sent successfully! 🚀', 'success');
            } else {
                const json = await res.json();
                showToast(json.error || 'Submission failed. Please try again.', 'error');
            }
        } catch (err) {
            showToast('Network error — please try again later.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'Send Message';
            }
        }
    });

    // ── TOAST NOTIFICATION ──
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 10001;
            padding: 16px 24px;
            border-radius: 12px;
            font-family: var(--font-body);
            font-size: 0.95rem;
            font-weight: 500;
            color: #fff;
            background: ${type === 'success'
                ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                : 'linear-gradient(135deg, #ef4444, #f43f5e)'};
            box-shadow: 0 12px 40px rgba(0,0,0,0.3);
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            max-width: 360px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // ── LOGO CLICK → scroll to top ──
    document.querySelector('.logo')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });
});
