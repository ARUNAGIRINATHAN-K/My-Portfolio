// scripts.js - extracted from index.html
// Lightweight UI helpers: section switching, mobile nav, dark mode
// Keep the contextmenu handler at top level to run early
document.addEventListener("contextmenu", function (event) {
    // keep this if you intentionally want to disable right-click
    event.preventDefault();
});

document.addEventListener('DOMContentLoaded', function () {
    function showSection(section) {
        document.querySelectorAll('.section-card').forEach(function (card) {
            card.classList.remove('active');
        });
        var el = document.getElementById('section-' + section);
        if (el) el.classList.add('active');
        // move focus to main content for screen reader users
        var main = document.getElementById('main-content');
        if (main) main.focus();
    }

    // Expose for debugging (optional)
    window.showSection = showSection;

    // Initial: show home
    showSection('home');

    // Side nav items
    document.querySelectorAll('.side-nav .nav-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            var href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                var section = href.substring(1);
                showSection(section);
                e.preventDefault();
            }
        });
    });

    // CTAs (hero/profile) that target projects/resume
    document.querySelectorAll('a[href="#projects"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            showSection('projects');
            e.preventDefault();
        });
    });
    document.querySelectorAll('a[href="#resume"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            showSection('resume');
            e.preventDefault();
        });
    });

    // Mobile nav behavior
    var hamburger = document.getElementById('hamburger');
    var mobileNav = document.getElementById('mobile-nav');
    var mobileClose = document.getElementById('mobile-close');
    var previouslyFocused = null;

    function openMobileNav() {
        previouslyFocused = document.activeElement;
        mobileNav.setAttribute('aria-hidden', 'false');
        // add visual class for CSS animations
        mobileNav.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        if (hamburger) hamburger.classList.add('open');
        // focus first link
        var first = mobileNav.querySelector('.mobile-link');
        if (first) first.focus();
        document.body.style.overflow = 'hidden';
        trapFocus(mobileNav);
    }

    function closeMobileNav() {
        mobileNav.setAttribute('aria-hidden', 'true');
        // remove visual class
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        if (hamburger) hamburger.classList.remove('open');
        document.body.style.overflow = '';
        releaseFocus();
        if (previouslyFocused) previouslyFocused.focus();
    }

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            var expanded = hamburger.getAttribute('aria-expanded') === 'true';
            if (!expanded) openMobileNav(); else closeMobileNav();
        });
    }
    if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);

    // Close mobile nav when link clicked and show the section
    document.querySelectorAll('.mobile-link').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                var section = href.substring(1);
                showSection(section);
                e.preventDefault();
            }
            closeMobileNav();
        });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var hidden = mobileNav.getAttribute('aria-hidden') === 'true';
            if (!hidden) closeMobileNav();
        }
    });

    // Simple focus trap implementation for modal mobile nav
    var focusableElements = null;
    var firstFocusable = null;
    var lastFocusable = null;

    function trapFocus(root) {
        focusableElements = root.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        if (!focusableElements || focusableElements.length === 0) return;
        firstFocusable = focusableElements[0];
        lastFocusable = focusableElements[focusableElements.length - 1];
        root.addEventListener('keydown', handleTrap);
    }

    function releaseFocus() {
        if (!mobileNav) return;
        mobileNav.removeEventListener('keydown', handleTrap);
    }

    function handleTrap(e) {
        if (e.key !== 'Tab') return;
        if (focusableElements.length === 1) { e.preventDefault(); return; }
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault(); lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault(); firstFocusable.focus();
            }
        }
    }

    // Dark mode toggle: respects localStorage, falls back to prefers-color-scheme
    var darkToggle = document.getElementById('dark-toggle');
    var rootEl = document.documentElement;

    function applyTheme(theme) {
        if (theme === 'dark') {
            rootEl.setAttribute('data-theme', 'dark');
            if (darkToggle) darkToggle.setAttribute('aria-pressed', 'true');
        } else {
            rootEl.removeAttribute('data-theme');
            if (darkToggle) darkToggle.setAttribute('aria-pressed', 'false');
        }
    }

    function initTheme() {
        var stored = localStorage.getItem('theme');
        if (stored) { applyTheme(stored); return; }
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }

    if (darkToggle) {
        darkToggle.addEventListener('click', function () {
            var isDark = rootEl.getAttribute('data-theme') === 'dark';
            var next = isDark ? 'light' : 'dark';
            applyTheme(next);
            try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
        });
    }
    initTheme();

});

/* End scripts.js */
