document.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on page reload to prevent downward shifting and ensure elements stay hidden until actual scroll
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // --- Dynamically load GSAP, ScrollTrigger, and initialize Tech Background ---
    function initTechBackground() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        const bgContainer = document.createElement('div');
        bgContainer.id = 'tech-bg-container';
        Object.assign(bgContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: '-1',
            overflow: 'hidden',
            background: 'radial-gradient(circle at center, rgba(20, 10, 40, 0.4) 0%, rgba(5, 5, 15, 0.98) 100%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 60px 60px, 60px 60px',
            backgroundPosition: 'center center'
        });
        document.body.insertBefore(bgContainer, document.body.firstChild);

        const symbols = ['{ }', '< />', '0101', 'AI', 'WEB3', 'λ', '=>', '0x', 'NODE', 'ETH', '</>', '[ ]', '++', 'async', 'await', 'API', 'REACT', 'VUE', 'RUST', 'GO', 'ML', 'DATA', '0', '1', '()', '///', '/**/', '&&', '||', '!=', '0x1A'];
        const colors = ['rgba(167, 139, 250, 0.4)', 'rgba(76, 215, 246, 0.4)', 'rgba(210, 187, 255, 0.3)', 'rgba(244, 114, 182, 0.4)', 'rgba(52, 211, 153, 0.3)'];
        const numElements = 65;
        const parallaxWrappers = [];

        // Single global timeline for all parallax elements on scroll to save CPU
        const globalParallaxTl = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom top",
                scrub: 1.5
            }
        });

        // 1. Dynamic Cursor Spotlight (toned down)
        const cursorGlow = document.createElement('div');
        Object.assign(cursorGlow.style, {
            position: 'absolute',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(76, 215, 246, 0.06) 0%, rgba(167, 139, 250, 0.02) 40%, transparent 70%)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            zIndex: '1',
            mixBlendMode: 'screen',
            opacity: 0
        });
        bgContainer.appendChild(cursorGlow);

        // 2. Neon Floating Symbols (toned down)
        for (let i = 0; i < numElements; i++) {
            const wrapper = document.createElement('div');
            Object.assign(wrapper.style, {
                position: 'absolute',
                left: `${Math.random() * 100}vw`,
                top: `${Math.random() * 100}vh`,
            });
            bgContainer.appendChild(wrapper);

            const el = document.createElement('div');
            el.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            
            Object.assign(el.style, {
                color: colors[Math.floor(Math.random() * colors.length)],
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: `${Math.random() * 40 + 15}px`,
                fontWeight: '700',
                opacity: 0,
                textShadow: '0 0 8px currentColor',
                whiteSpace: 'nowrap'
            });
            
            wrapper.appendChild(el);
            parallaxWrappers.push({ node: wrapper, speed: Math.random() * 1.5 + 0.5 });

            gsap.to(el, {
                opacity: Math.random() * 0.25 + 0.1,
                duration: Math.random() * 2 + 1,
                delay: Math.random() * 2
            });

            gsap.to(el, {
                y: `+=${Math.random() * 200 - 100}`,
                x: `+=${Math.random() * 150 - 75}`,
                rotation: Math.random() * 180 - 90,
                duration: Math.random() * 20 + 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            globalParallaxTl.to(wrapper, {
                yPercent: - (Math.random() * 400 + 150),
                ease: "none"
            }, 0);
        }

        // 3. Giant Ambient Glowing Orbs (toned down)
        const numOrbs = 5;
        const orbColors = ['rgba(167, 139, 250, 0.15)', 'rgba(76, 215, 246, 0.15)', 'rgba(210, 187, 255, 0.12)', 'rgba(244, 114, 182, 0.15)', 'rgba(52, 211, 153, 0.12)'];
        for (let i = 0; i < numOrbs; i++) {
            const wrapper = document.createElement('div');
            Object.assign(wrapper.style, {
                position: 'absolute',
                left: `${Math.random() * 100}vw`,
                top: `${Math.random() * 100}vh`,
            });
            bgContainer.appendChild(wrapper);

            const orb = document.createElement('div');
            Object.assign(orb.style, {
                width: `${Math.random() * 600 + 300}px`,
                height: `${Math.random() * 600 + 300}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${orbColors[i % orbColors.length]} 0%, transparent 70%)`,
                mixBlendMode: 'screen',
                transform: 'translate(-50%, -50%)'
            });
            wrapper.appendChild(orb);
            parallaxWrappers.push({ node: wrapper, speed: Math.random() * 0.2 + 0.05 });

            gsap.to(orb, {
                x: `+=${Math.random() * 300 - 150}`,
                y: `+=${Math.random() * 300 - 150}`,
                scale: Math.random() * 0.5 + 1.2,
                duration: Math.random() * 12 + 8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            globalParallaxTl.to(wrapper, {
                yPercent: - (Math.random() * 200 + 50),
                ease: "none"
            }, 0);
        }

        // Add interactive mouse parallax & cursor spotlight
        // Setup gsap.quickTo for highly optimized mouse movement
        const cursorXTo = gsap.quickTo(cursorGlow, "x", {duration: 0.6, ease: "power2.out"});
        const cursorYTo = gsap.quickTo(cursorGlow, "y", {duration: 0.6, ease: "power2.out"});
        const cursorOpacityTo = gsap.quickTo(cursorGlow, "opacity", {duration: 0.6, ease: "power2.out"});
        
        const parallaxXSetters = parallaxWrappers.map(item => gsap.quickTo(item.node, "x", {duration: 2, ease: "power2.out"}));
        const parallaxYSetters = parallaxWrappers.map(item => gsap.quickTo(item.node, "y", {duration: 2, ease: "power2.out"}));

        window.addEventListener('mousemove', (e) => {
            // Update Spotlight
            cursorXTo(e.clientX);
            cursorYTo(e.clientY);
            cursorOpacityTo(1);

            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;

            // Parallax Shift using quickTo setters
            parallaxWrappers.forEach((item, index) => {
                parallaxXSetters[index](mouseX * 150 * item.speed);
                parallaxYSetters[index](mouseY * 150 * item.speed);
            });
        });
        
        // Hide spotlight when mouse leaves the window
        document.body.addEventListener('mouseleave', () => {
            cursorOpacityTo(0);
        });
    }

    // --- Hero Section Matrix Dissolve Effect ---
    function initHeroScrollTrigger() {
        const heroSection = document.getElementById('hero-section');
        const heroContent = document.getElementById('hero-content');
        
        if (!heroSection || !heroContent) return;

        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "+=150%",
                pin: true,
                scrub: 1,
            }
        });

        // Matrix Decode/Dissolve effect for text
        const heroH1 = heroContent.querySelector('h1');
        const originalText = heroH1 ? heroH1.innerText : "";
        const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/{}[]";
        
        // Track last time we updated DOM to prevent reflow thrashing on every tick
        let lastScrambleTime = 0;
        
        heroTl.to(heroContent, {
            scale: 1.5,
            opacity: 0,
            // Removed expensive blur filter from scroll animation for performance
            y: -100,
            duration: 1,
            ease: "power2.in",
            onUpdate: function() {
                if (heroH1) {
                    const progress = this.progress();
                    const now = Date.now();
                    
                    // Throttle DOM updates to max ~15 times per second
                    if (now - lastScrambleTime > 60) {
                        lastScrambleTime = now;
                        if (progress > 0 && progress < 0.9) {
                            // Scramble text relative to progress
                            const scrambleChance = progress * 1.5; 
                            let newText = originalText.split('').map((char) => {
                                if (char === ' ' || char === '\n') return char;
                                return Math.random() < scrambleChance ? matrixChars[Math.floor(Math.random() * matrixChars.length)] : char;
                            }).join('');
                            heroH1.innerText = newText;
                        } else if (progress === 0) {
                            heroH1.innerText = originalText; // Reset when scrolled back
                        }
                    }
                }
            }
        }, 0);

        // Tech Symbols fly past the camera (Warp Drive effect)
        const techWrappers = document.querySelectorAll('#tech-bg-container > div');
        techWrappers.forEach((wrapper, index) => {
            if(index === 0) return; // Skip cursor glow
            
            heroTl.to(wrapper, {
                scale: Math.random() * 8 + 4,
                opacity: 0,
                duration: 1,
                ease: "power3.in"
            }, 0);
        });
    }

    const loadScript = (src, onLoad) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = onLoad;
        document.head.appendChild(script);
    };

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js", () => {
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js", () => {
            initTechBackground();
            initHeroScrollTrigger();
        });
    });
    // --- End Tech Background ---

    // 0. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('nav-scrolled');
                navbar.classList.remove('bg-bg-surface/70', 'border-white/5');
            } else {
                navbar.classList.remove('nav-scrolled');
                navbar.classList.add('bg-bg-surface/70', 'border-white/5');
            }
        });
    }

    // 2. Intersection Observer for Reveal Animations (Landing page + FAQ)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    // 3. Animated Counters (Moved up for IntersectionObserver)
    function animateValue(obj, start, end, duration, prefix = '', suffix = '') {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = prefix + Math.floor(progress * (end - start) + start) + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('reveal')) {
                    entry.target.classList.add('active');
                    if (entry.target.id === 'about') {
                        const h1 = entry.target.querySelector('h1.opacity-0');
                        const card = entry.target.querySelector('.glass-card.opacity-0');
                        const grid = entry.target.querySelector('.grid.opacity-0');

                        if (h1) {
                            h1.classList.add('animate-slide-up');
                            h1.classList.remove('opacity-0');
                        }
                        
                        if (card) {
                            setTimeout(() => {
                                card.classList.add('animate-slide-up');
                                card.classList.remove('opacity-0');
                            }, 300);
                        }
                        
                        if (grid) {
                            setTimeout(() => {
                                grid.classList.add('animate-slide-up');
                                grid.classList.remove('opacity-0');
                            }, 600);
                        }

                        if (document.getElementById('stat-0')) {
                            setTimeout(() => {
                                animateValue(document.getElementById('stat-0'), 0, 18, 2000, '', ' Days');
                                animateValue(document.getElementById('stat-1'), 0, 500, 2000, '300-', '');
                                animateValue(document.getElementById('stat-2'), 0, 15, 2000, '', '+');
                                animateValue(document.getElementById('stat-3'), 0, 100, 2000, '', '%');
                            }, 600);
                        }
                    }
                } else if (entry.target.classList.contains('scroll-animate')) {
                    entry.target.classList.add('animate-fade-in-up');
                    entry.target.classList.remove('opacity-0');
                }
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .scroll-animate').forEach(el => {
        observer.observe(el);
    });

    // Animated Counters logic has been moved up and integrated into the IntersectionObserver

    // 4. Countdown Timer (Landing page)
    const daysEl = document.getElementById("days");
    if (daysEl) {
        const countDownDate = new Date("Jun 30, 2026 00:00:00").getTime();
        const countdownInterval = setInterval(function () {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysEl.innerHTML = days < 10 ? "0" + days : days;
            document.getElementById("hours").innerHTML = hours < 10 ? "0" + hours : hours;
            document.getElementById("minutes").innerHTML = minutes < 10 ? "0" + minutes : minutes;
            document.getElementById("seconds").innerHTML = seconds < 10 ? "0" + seconds : seconds;

            if (distance < 0) {
                clearInterval(countdownInterval);
                daysEl.innerHTML = "00";
                document.getElementById("hours").innerHTML = "00";
                document.getElementById("minutes").innerHTML = "00";
                document.getElementById("seconds").innerHTML = "00";
            }
        }, 1000);
    }

    // 5. FAQ Accordion Logic
    const accordionItems = document.querySelectorAll('.accordion-item');
    if (accordionItems.length > 0) {
        accordionItems.forEach(item => {
            const button = item.querySelector('button');
            const icon = item.querySelector('.material-symbols-outlined[data-icon-state]');

            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';

                accordionItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('is-active', 'border-l-primary', 'bg-bg-raised');
                        otherItem.classList.add('border-l-transparent');
                        otherItem.querySelector('button').setAttribute('aria-expanded', 'false');
                        let otherIcon = otherItem.querySelector('.material-symbols-outlined[data-icon-state]');
                        if(otherIcon) {
                            otherIcon.textContent = 'add';
                            otherIcon.style.transform = 'rotate(0deg)';
                        }
                    }
                });

                if (!isExpanded) {
                    item.classList.add('is-active', 'border-l-primary', 'bg-bg-raised');
                    item.classList.remove('border-l-transparent');
                    button.setAttribute('aria-expanded', 'true');
                    if(icon) {
                        icon.textContent = 'remove';
                        icon.style.transform = 'rotate(180deg)';
                    }
                } else {
                    item.classList.remove('is-active', 'border-l-primary', 'bg-bg-raised');
                    item.classList.add('border-l-transparent');
                    button.setAttribute('aria-expanded', 'false');
                    if(icon) {
                        icon.textContent = 'add';
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            });
        });
    }

    // 6. Timeline Logic
    const timelineContainer = document.querySelector('.relative.pl-8.md\\:pl-16.py-8');
    if (timelineContainer) {
        const eventDates = [
            new Date("2026-06-12T00:00:00+08:00"),
            new Date("2026-06-26T00:00:00+08:00"),
            new Date("2026-07-31T00:00:00+08:00"),
            new Date("2026-08-07T00:00:00+08:00"),
            new Date("2026-08-15T00:00:00+08:00"),
            new Date("2026-08-26T00:00:00+08:00"),
            new Date("2026-09-04T23:59:00+08:00"),
            new Date("2026-09-12T08:00:00+08:00"),
            new Date("2026-09-12T09:00:00+08:00")
        ];

        function updateTimelineGlow() {
            const now = new Date();
            const cards = Array.from(timelineContainer.querySelectorAll(':scope > .relative.mb-section-gap'));

            let activeIndex = -1;
            for (let i = 0; i < eventDates.length; i++) {
                if (now >= eventDates[i]) activeIndex = i;
            }

            cards.forEach((cardWrap, index) => {
                const card = cardWrap.querySelector('.rounded-xl');
                const nodeWrap = cardWrap.querySelector('.absolute.z-10.flex.items-center.justify-center, .absolute.rounded-full.z-10');
                const title = cardWrap.querySelector('h3');

                if (!card || !nodeWrap || !title) return;

                const dateBadge = cardWrap.querySelector('.font-label-mono.flex.items-center');

                let headerRow = title.parentElement;
                if (!headerRow.classList.contains('gap-3')) {
                    const wrap = document.createElement('div');
                    wrap.className = "flex items-center gap-3";
                    headerRow.insertBefore(wrap, title);
                    wrap.appendChild(title);
                    headerRow = wrap;
                }

                const existingBadges = headerRow.querySelectorAll('span.text-\\[10px\\]');
                existingBadges.forEach(b => b.remove());

                const existingGlow = card.querySelector('.blur-\\[50px\\]');
                if (existingGlow) existingGlow.remove();

                if (index === activeIndex) {
                    card.className = "bg-surface-container/80 backdrop-blur-2xl border border-secondary/30 rounded-xl p-6 md:p-8 shadow-[0_4px_30px_rgba(76,215,246,0.05)] relative overflow-hidden group";

                    const glowBg = document.createElement('div');
                    glowBg.className = "absolute -right-20 -top-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px] pointer-events-none";
                    card.insertBefore(glowBg, card.firstChild);

                    nodeWrap.className = "absolute -left-[41px] md:-left-[57px] top-1 w-6 h-6 z-10 flex items-center justify-center";
                    nodeWrap.innerHTML = `
                        <div class="absolute inset-0 rounded-full border-2 border-secondary animate-pulse-ring"></div>
                        <div class="w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_#4cd7f6]"></div>
                    `;

                    title.className = "font-headline-md text-headline-md text-text-primary group-hover:text-secondary transition-colors relative z-10";
                    if (dateBadge) dateBadge.className = "font-label-mono text-label-mono text-secondary flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-md border border-secondary/20 relative z-10";

                    const badge = document.createElement('span');
                    badge.className = "px-2 py-0.5 rounded text-[10px] font-label-caps tracking-widest bg-secondary/20 text-secondary border border-secondary/30 relative z-10";
                    badge.innerText = "ACTIVE";
                    headerRow.appendChild(badge);

                } else if (index < activeIndex) {
                    card.className = "bg-surface-container-low/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 md:p-8 hover:border-primary/30 hover:bg-surface-container/80 transition-all duration-300 opacity-80";

                    nodeWrap.className = "absolute -left-[37px] md:-left-[53px] top-1.5 w-4 h-4 rounded-full bg-primary border-2 border-primary z-10 flex items-center justify-center shadow-[0_0_10px_rgba(210,187,255,0.4)]";
                    nodeWrap.innerHTML = ``;

                    title.className = "font-headline-md text-headline-md text-text-primary/80";
                    if (dateBadge) dateBadge.className = "font-label-mono text-label-mono text-primary/80 flex items-center gap-2";

                } else {
                    card.className = "bg-surface-container-low/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 md:p-8 hover:border-primary/30 hover:bg-surface-container/80 transition-all duration-300";

                    nodeWrap.className = "absolute -left-[37px] md:-left-[53px] top-1.5 w-4 h-4 rounded-full bg-surface border-2 border-primary z-10 flex items-center justify-center";
                    nodeWrap.innerHTML = `<div class="w-1.5 h-1.5 rounded-full bg-transparent"></div>`;

                    title.className = "font-headline-md text-headline-md text-text-primary";
                    if (dateBadge) dateBadge.className = "font-label-mono text-label-mono text-primary flex items-center gap-2";
                }
            });
        }

        updateTimelineGlow();
        setInterval(updateTimelineGlow, 60000);
    }
});
