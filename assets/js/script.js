document.addEventListener('DOMContentLoaded', () => {
    // Navigation logic
    const navLinks = document.querySelectorAll('.nav-links li, .nav-btn');
    const sections = document.querySelectorAll('.page-section');
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinksContainer.classList.toggle('nav-active');
            const icon = hamburger.querySelector('i');
            if (navLinksContainer.classList.contains('nav-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Close mobile menu if open
            if (navLinksContainer.classList.contains('nav-active')) {
                navLinksContainer.classList.remove('nav-active');
                const icon = hamburger.querySelector('i');
                if(icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }

            const targetId = link.getAttribute('data-target');
            if (targetId) {
                // Update active link in navbar
                document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
                // Find corresponding nav li if triggered from button
                const correspondingNav = document.querySelector(`.nav-links li[data-target="${targetId}"]`);
                if(correspondingNav) correspondingNav.classList.add('active');

                // Hide all sections, show target
                sections.forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById(targetId).classList.add('active');
                
                // Scroll to top
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Theme toggle logic
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('i');
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const body = document.body;
            if (body.getAttribute('data-theme') === 'minimal') {
                body.removeAttribute('data-theme');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            } else {
                body.setAttribute('data-theme', 'minimal');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        });
    }

    // Typewriter effect
    const phrases = [
        "Full Stack Developer.",
        "Data Scientist.",
        "MLOps.",
        "AI Practitioner."
    ];
    let i = 0; // phrase index
    let j = 0; // char index
    let currentPhrase = '';
    let isDeleting = false;
    
    const typeWriterEl = document.getElementById('typewriter');
    
    function loop() {
        if (!typeWriterEl) return;
        
        const fullPhrase = phrases[i];
        
        if (isDeleting) {
            // Remove a character
            currentPhrase = fullPhrase.substring(0, j - 1);
            j--;
        } else {
            // Add a character
            currentPhrase = fullPhrase.substring(0, j + 1);
            j++;
        }
        
        typeWriterEl.innerHTML = currentPhrase;
        
        // Base typing speeds
        let typingSpeed = isDeleting ? 40 : 80;
        
        // If word is completely typed, pause and set to delete
        if (!isDeleting && j === fullPhrase.length) {
            typingSpeed = 1500; // Wait before deleting
            isDeleting = true;
        } 
        // If word is completely deleted, move to next string and pause
        else if (isDeleting && j === 0) {
            isDeleting = false;
            i++;
            if (i === phrases.length) {
                i = 0;
            }
            typingSpeed = 300; // Wait before typing new word
        }
        
        setTimeout(loop, typingSpeed);
    }
    
    // Start typing effect
    setTimeout(loop, 500);

    // Simple particle background generator
    const particleContainer = document.getElementById('particle-container');
    const particleCount = 50;
    
    if (particleContainer) {
        for (let p = 0; p < particleCount; p++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random size between 2px and 6px
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random position
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            
            // Random opacity
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            
            particleContainer.appendChild(particle);
            
            // Animate particles slowly
            animateParticle(particle);
        }
    }

    function animateParticle(particle) {
        const speed = Math.random() * 1 + 0.5;
        const limitY = window.innerHeight;
        
        let currentY = parseFloat(particle.style.top);
        
        function move() {
            currentY -= speed;
            if (currentY < -10) {
                currentY = limitY + 10;
                particle.style.left = `${Math.random() * 100}vw`;
            }
            particle.style.top = `${currentY}px`;
            requestAnimationFrame(move);
        }
        
        requestAnimationFrame(move);
    }

    // Contact form AJAX submission (Formspree)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            try {
                const res = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    contactForm.reset();
                    alert('Thanks — message sent!');
                } else {
                    const json = await res.json();
                    alert(json.error || 'Submission failed.');
                }
            } catch (err) {
                alert('Network error — try again later.');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});