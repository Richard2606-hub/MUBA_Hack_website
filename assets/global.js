document.addEventListener('DOMContentLoaded', () => {
    // Signal that JS is loaded — used by CSS to gate animation visibility
    document.documentElement.classList.add('js-loaded');

    // Force scroll to top on page reload to prevent downward shifting and ensure elements stay hidden until actual scroll
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // --- Mobile detection (used throughout for performance gating) ---
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches)
        || ('ontouchstart' in window && window.innerWidth < 1024);

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

        const symbols = ['{ }', '</ >', '0101', 'AI', 'WEB3', 'λ', '=>', '0x', 'NODE', 'ETH', '</>', '[ ]', '++', 'async', 'await', 'API', 'REACT', 'VUE', 'RUST', 'GO', 'ML', 'DATA', '0', '1', '()', '///', '/**/', '&&', '||', '!=', '0x1A'];
        const colors = ['rgba(167, 139, 250, 0.4)', 'rgba(76, 215, 246, 0.4)', 'rgba(210, 187, 255, 0.3)', 'rgba(244, 114, 182, 0.4)', 'rgba(52, 211, 153, 0.3)'];

        // Fix 1: Drastically reduce element count on mobile to prevent GPU saturation
        const numElements = isMobile ? 15 : 65;
        const numOrbs = isMobile ? 2 : 5;

        const parallaxWrappers = [];
        // Store all infinite tweens so we can pause/resume them (Fix 3)
        const infiniteTweens = [];

        // Single global timeline for all parallax elements on scroll to save CPU
        const globalParallaxTl = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom top",
                scrub: 1.5
            }
        });

        // 1. Dynamic Cursor Spotlight (skip on mobile — no mouse cursor)
        let cursorGlow = null;
        if (!isMobile) {
            cursorGlow = document.createElement('div');
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
                opacity: 0,
                willChange: 'transform, opacity'
            });
            bgContainer.appendChild(cursorGlow);
        }

        // 2. Neon Floating Symbols (reduced count on mobile)
        for (let i = 0; i < numElements; i++) {
            const wrapper = document.createElement('div');
            Object.assign(wrapper.style, {
                position: 'absolute',
                left: `${Math.random() * 100}vw`,
                top: `${Math.random() * 100}vh`,
                // Fix 2: Promote to compositor layer for GPU-only compositing
                
            });
            bgContainer.appendChild(wrapper);

            const el = document.createElement('div');
            el.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            
            const elStyles = {
                color: colors[Math.floor(Math.random() * colors.length)],
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: `${Math.random() * 40 + 15}px`,
                fontWeight: '700',
                opacity: 0,
                whiteSpace: 'nowrap'
            };

            // Fix 2: Remove textShadow on mobile — it forces expensive paint operations per frame
            if (!isMobile) {
                elStyles.textShadow = '0 0 8px currentColor';
            }
            
            Object.assign(el.style, elStyles);
            
            wrapper.appendChild(el);
            parallaxWrappers.push({ node: wrapper, speed: Math.random() * 1.5 + 0.5 });

            gsap.to(el, {
                opacity: Math.random() * 0.25 + 0.1,
                duration: Math.random() * 2 + 1,
                delay: Math.random() * 2
            });

            // Fix 3: Store infinite tweens so we can pause them when off-screen
            const floatTween = gsap.to(el, {
                y: `+=${Math.random() * 200 - 100}`,
                x: `+=${Math.random() * 150 - 75}`,
                rotation: Math.random() * 180 - 90,
                duration: isMobile ? Math.random() * 30 + 15 : Math.random() * 20 + 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                force3D: false  // Fix 2: Force GPU compositing
            });
            infiniteTweens.push(floatTween);

            globalParallaxTl.to(wrapper, {
                yPercent: - (Math.random() * 400 + 150),
                ease: "none",
                force3D: false
            }, 0);
        }

        // 3. Giant Ambient Glowing Orbs (reduced count on mobile)
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
            const orbSize = isMobile ? Math.random() * 400 + 200 : Math.random() * 600 + 300;
            Object.assign(orb.style, {
                width: `${orbSize}px`,
                height: `${orbSize}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${orbColors[i % orbColors.length]} 0%, transparent 70%)`,
                mixBlendMode: 'screen',
                transform: 'translate(-50%, -50%)'
            });
            wrapper.appendChild(orb);
            parallaxWrappers.push({ node: wrapper, speed: Math.random() * 0.2 + 0.05 });

            // Fix 3: Store infinite tweens
            const orbTween = gsap.to(orb, {
                x: `+=${Math.random() * 300 - 150}`,
                y: `+=${Math.random() * 300 - 150}`,
                scale: Math.random() * 0.5 + 1.2,
                duration: isMobile ? Math.random() * 18 + 12 : Math.random() * 12 + 8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                force3D: false
            });
            infiniteTweens.push(orbTween);

            globalParallaxTl.to(wrapper, {
                yPercent: - (Math.random() * 200 + 50),
                ease: "none",
                force3D: false
            }, 0);
        }

        // Fix 3: Pause infinite tweens when hero section is scrolled past (they're not visible)
        const heroSection = document.getElementById('hero-section');
        if (heroSection) {
            ScrollTrigger.create({
                trigger: heroSection,
                start: "top top",
                // End well after the hero is off-screen (account for pin duration)
                end: "+=300%",
                onLeave: () => {
                    infiniteTweens.forEach(t => t.pause());
                },
                onEnterBack: () => {
                    infiniteTweens.forEach(t => t.resume());
                },
            });
        }

        // Fix 4: Skip mouse parallax entirely on touch devices — no cursor to follow
        if (!isMobile) {
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
                end: "+=100%",
                pin: !isMobile,
                scrub: true,  // Remove lerp lag for immediate scroll response
                // Fix 5: Prevent GSAP from using anticipatePin on mobile (can cause flicker)
                anticipatePin: isMobile ? 0 : 1,
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
            y: -100,
            duration: 1,
            ease: "power2.in",
            force3D: false,  // Fix 2: Force GPU compositing
            onUpdate: function() {
                if (heroH1) {
                    const progress = this.progress();

                    // Fix 5: Skip matrix text scramble on mobile — DOM manipulation
                    // during scrub forces layout recalculation and causes jank
                    if (isMobile) {
                        // On mobile, just reset text when scrolled back to top
                        if (progress === 0) {
                            heroH1.innerText = originalText;
                        }
                        return;
                    }

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
        // Fix 5: On mobile, limit warp drive to first 8 elements instead of all 70
        const maxWarpElements = isMobile ? 8 : techWrappers.length;
        let warpCount = 0;

        techWrappers.forEach((wrapper, index) => {
            if(index === 0 && !isMobile) return; // Skip cursor glow (only exists on desktop)
            if(isMobile && index === 0) return; // Skip first wrapper on mobile too
            
            if (warpCount >= maxWarpElements) return;
            warpCount++;

            heroTl.to(wrapper, {
                scale: Math.random() * 8 + 4,
                opacity: 0,
                duration: 1,
                ease: "power3.in",
                force3D: false
            }, 0);
        });
    }

    const loadScript = (src, onLoad) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = onLoad;
        document.head.appendChild(script);
    };

    // Fix 7: Use requestIdleCallback to defer non-critical animation init
    // so it doesn't block the initial paint and user interaction
    const deferInit = (callback) => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout: 2000 });
        } else {
            // Fallback for browsers without requestIdleCallback (Safari)
            setTimeout(callback, 100);
        }
    };

    deferInit(() => {
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js", () => {
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js", () => {
                initTechBackground();
                initHeroScrollTrigger();
            });
        });
    });
    // --- End Tech Background ----

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

    // 1. Navbar Scroll Effect (debounced with rAF to prevent flicker)
    const navbar = document.getElementById('navbar');
    if (navbar) {
        let navTicking = false;
        window.addEventListener('scroll', () => {
            if (!navTicking) {
                navTicking = true;
                requestAnimationFrame(() => {
                    if (window.scrollY > 50) {
                        navbar.classList.add('nav-scrolled');
                        navbar.classList.remove('bg-bg-surface/70', 'border-white/5');
                    } else {
                        navbar.classList.remove('nav-scrolled');
                        navbar.classList.add('bg-bg-surface/70', 'border-white/5');
                    }
                    navTicking = false;
                });
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
                            h1.style.visibility = 'visible';
                            h1.classList.add('animate-slide-up');
                            h1.classList.remove('opacity-0');
                        }
                        
                        if (card) {
                            setTimeout(() => {
                                card.style.visibility = 'visible';
                                card.classList.add('animate-slide-up');
                                card.classList.remove('opacity-0');
                            }, 300);
                        }
                        
                        if (grid) {
                            setTimeout(() => {
                                grid.style.visibility = 'visible';
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
                    entry.target.style.visibility = 'visible';
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
    const timerTitleEl = document.getElementById("timer-title");
    if (daysEl) {
        const registrationStartDate = new Date("Jun 30, 2026 00:00:00").getTime();
        const registrationCloseDate = new Date("Aug 1, 2026 23:59:59").getTime();
        const countdownInterval = setInterval(function () {
            const now = new Date().getTime();
            let distance;
            let isRegistrationOpen = false;

            if (now < registrationStartDate) {
                distance = registrationStartDate - now;
                if (timerTitleEl && timerTitleEl.innerText !== "Registration Starts In") {
                    timerTitleEl.innerText = "Registration Starts In";
                }
            } else {
                distance = registrationCloseDate - now;
                isRegistrationOpen = true;
                if (timerTitleEl && timerTitleEl.innerText !== "Registration Closes In") {
                    timerTitleEl.innerText = "Registration Closes In";
                }
            }

            if (distance < 0 && isRegistrationOpen) {
                clearInterval(countdownInterval);
                daysEl.innerHTML = "00";
                document.getElementById("hours").innerHTML = "00";
                document.getElementById("minutes").innerHTML = "00";
                document.getElementById("seconds").innerHTML = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysEl.innerHTML = days < 10 ? "0" + days : days;
            document.getElementById("hours").innerHTML = hours < 10 ? "0" + hours : hours;
            document.getElementById("minutes").innerHTML = minutes < 10 ? "0" + minutes : minutes;
            document.getElementById("seconds").innerHTML = seconds < 10 ? "0" + seconds : seconds;
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
            new Date("2026-06-20T00:00:00+08:00"),
            new Date("2026-06-30T00:00:00+08:00"),
            new Date("2026-08-25T23:59:00+08:00"),
            new Date("2026-09-05T23:59:00+08:00"),
            new Date("2026-09-06T08:00:00+08:00")
        ];

        function updateTimelineGlow() {
            const now = new Date();
            const cards = Array.from(timelineContainer.querySelectorAll(':scope > .relative.mb-section-gap'));

            cards.forEach((cardWrap, index) => {
                const eDate = eventDates[index];
                const isToday = now.getFullYear() === eDate.getFullYear() && 
                                now.getMonth() === eDate.getMonth() && 
                                now.getDate() === eDate.getDate();
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

                if (isToday) {
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

                } else if (now > eDate) {
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

document.addEventListener('DOMContentLoaded', () => {
    const registrationStartDate = new Date('2026-06-30T00:00:00+08:00');
    const currentDate = new Date();
    
    // Find all links and buttons that say 'Register with Devfolio'
    const buttons = Array.from(document.querySelectorAll('a, button')).filter(el => el.textContent.trim() === 'Register with Devfolio');
    
    buttons.forEach(btn => {
        // Preserve responsive visibility utilities from the original markup so that
        // the navbar CTA (hidden md:block) doesn't suddenly appear on mobile, etc.
        const orig = btn.className.split(/\s+/);
        const hasHidden = orig.includes('hidden');
        const respVis = orig.filter(c => /^(sm|md|lg|xl|2xl):(hidden|block|inline-block|flex|inline-flex)$/.test(c));

        const styling = ['mt-2', 'items-center', 'justify-center', 'font-bold', 'text-white', 'px-8', 'py-3', 'rounded-full', 'active:scale-95', 'transition-all', 'duration-300', 'max-w-[280px]'];

        if (hasHidden) {
            btn.className = ['hidden', ...respVis, ...styling, 'w-auto'].join(' ');
        } else {
            btn.className = ['inline-flex', 'w-full', 'sm:w-auto', ...respVis, ...styling].join(' ');
        }
        btn.style.background = 'linear-gradient(90deg, #10B981 0%, #39FF14 100%)';
        btn.style.boxShadow = 'none';

        if (currentDate < registrationStartDate) {
            btn.textContent = 'Opens on 30 June';
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
            if(btn.tagName === 'A') btn.removeAttribute('href');
        } else {
            btn.textContent = 'Register with Devfolio';
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';
            if(btn.tagName === 'A' && !btn.getAttribute('href')) btn.setAttribute('href', '#');
            
            // Add hover glow for active state
            btn.addEventListener('mouseenter', () => {
                btn.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.4)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.boxShadow = 'none';
            });
        }
    });
});

