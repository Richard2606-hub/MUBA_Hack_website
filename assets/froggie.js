/**
 * ============================================================
 *  MUBA Froggie — Living Mascot Pet Widget
 *  Self-contained script. Loaded by global.js on every page.
 * ============================================================
 */
(function () {
    'use strict';

    /* ─── Asset paths ─── */
    var scriptTag = document.querySelector('script[src*="froggie.js"]');
    var basePath = scriptTag
        ? scriptTag.src.replace(/froggie\.js.*$/, '')
        : '../assets/';
    // Mascot images are one level up from assets/ in /Mascot/
    var mascotBase = basePath.replace(/assets\/?$/, '') + 'Mascot/';

    var POSES = {
        chill:    mascotBase + 'MUBA%20Froggie%20Chill.png',
        happy:    mascotBase + 'MUBA%20Froggie%20Happy.png',
        salute:   mascotBase + 'MUBA%20Froggie%20Salute.png',
        stress:   mascotBase + 'MUBA%20Froggie%20Stresss.png',
        swag:     mascotBase + 'MUBA%20Froggie%20Swag.png',
        thinking: mascotBase + 'MUBA%20Froggie%20Thinking.png',
        thumbsup: mascotBase + 'MUBA%20Froggie%20Thumbs%20Up.png'
    };

    var POSE_KEYS = Object.keys(POSES);

    /* ─── Page-aware default moods ─── */
    var pageMoods = {
        'official_landing_page': 'happy',
        'event_timeline':        'salute',
        'sponsors':              'swag',
        'prize_pool':            'happy',
        'judges_n_mentors':      'salute',
        'getting_here':          'thumbsup',
        'frequently_asked':      'thinking',
        'challenge_tracks':      'swag',
        'track-details-ai':      'stress',
        'track-details-defi':    'stress',
        'track-details-infra':   'stress',
        'track-details-consumer':'stress',
        'track-details':         'stress'
    };

    function detectPageMood() {
        var path = window.location.pathname.toLowerCase();
        var keys = Object.keys(pageMoods);
        for (var i = 0; i < keys.length; i++) {
            if (path.indexOf(keys[i]) !== -1) return pageMoods[keys[i]];
        }
        return 'happy'; // fallback
    }

    /* ─── Speech bubble messages ─── */
    var MESSAGES = [
        { text: "🤝 Need teammates? Join our Discord!", link: "https://discord.gg/2WrGAwpWVW" },
        { text: "⏰ Registration closes soon — don't miss out!" },
        { text: "💡 Check out the Challenge Tracks!" },
        { text: "🏆 RM42,000 in prizes up for grabs!" },
        { text: "🇲🇾 Open to Malaysian citizens & visa holders!" },
        { text: "👋 Hi! I'm Froggie, your MUBA buddy!" },
        { text: "🔥 Ready to hack the future?" },
        { text: "🐸 *ribbit* Drag me around if you want!" },
        { text: "💻 Build something amazing at MUBA 2026!" },
        { text: "🌿 I'm just chilling here on my lily pad~" }
    ];

    /* ─── State ─── */
    var currentPose = detectPageMood();
    var isDragging = false;
    var isHovered = false;
    var bubbleTimeout = null;
    var moodCycleTimer = null;
    var idleBubbleTimer = null;
    var lastScrollY = 0;
    var scrollSpeedTimer = null;
    var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

    /* ─── Create DOM ─── */
    // Outer container
    var container = document.createElement('div');
    container.id = 'froggie-pet';
    container.setAttribute('aria-label', 'MUBA Froggie mascot pet');

    // Speech bubble
    var bubble = document.createElement('div');
    bubble.id = 'froggie-bubble';

    var bubbleText = document.createElement('span');
    bubbleText.id = 'froggie-bubble-text';
    bubble.appendChild(bubbleText);

    // Froggie image wrapper (for animations)
    var imgWrap = document.createElement('div');
    imgWrap.id = 'froggie-img-wrap';

    var img = document.createElement('img');
    img.id = 'froggie-img';
    img.src = POSES[currentPose];
    img.alt = 'MUBA Froggie';
    img.draggable = false;

    // Shadow beneath Froggie
    var shadow = document.createElement('div');
    shadow.id = 'froggie-shadow';

    imgWrap.appendChild(img);
    container.appendChild(bubble);
    container.appendChild(imgWrap);
    container.appendChild(shadow);

    /* ─── Inject CSS ─── */
    var style = document.createElement('style');
    style.textContent = [
        '/* ─── Froggie Pet Widget ─── */',
        '#froggie-pet {',
        '  position: fixed;',
        '  bottom: 20px;',
        '  right: 20px;',
        '  z-index: 99998;',
        '  display: flex;',
        '  flex-direction: column;',
        '  align-items: center;',
        '  pointer-events: auto;',
        '  user-select: none;',
        '  -webkit-user-select: none;',
        '  transition: bottom 0.3s ease, right 0.3s ease;',
        '  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4));',
        '}',

        '#froggie-img-wrap {',
        '  width: ' + (isMobile ? '70px' : '100px') + ';',
        '  height: ' + (isMobile ? '70px' : '100px') + ';',
        '  cursor: grab;',
        '  position: relative;',
        '  animation: froggie-breathe 3s ease-in-out infinite, froggie-bob 4s ease-in-out infinite;',
        '  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);',
        '}',

        '#froggie-img-wrap:active { cursor: grabbing; }',

        '#froggie-img {',
        '  width: 100%;',
        '  height: 100%;',
        '  object-fit: contain;',
        '  pointer-events: none;',
        '  transition: opacity 0.3s ease;',
        '}',

        '#froggie-shadow {',
        '  width: 60px;',
        '  height: 10px;',
        '  background: radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%);',
        '  border-radius: 50%;',
        '  margin-top: -6px;',
        '  animation: froggie-shadow-pulse 4s ease-in-out infinite;',
        '}',

        '#froggie-bubble {',
        '  position: relative;',
        '  background: #0b0f0d;',
        '  border: 1px solid rgba(57,255,20,0.35);',
        '  border-radius: 12px;',
        '  padding: 8px 14px;',
        '  margin-bottom: 8px;',
        '  max-width: 220px;',
        '  font-family: "JetBrains Mono", monospace;',
        '  font-size: 11px;',
        '  color: #cbd5e1;',
        '  line-height: 1.45;',
        '  box-shadow: 0 0 20px rgba(57,255,20,0.1), 0 4px 20px rgba(0,0,0,0.5);',
        '  opacity: 0;',
        '  transform: translateY(8px) scale(0.9);',
        '  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);',
        '  pointer-events: none;',
        '  text-align: center;',
        '}',

        '#froggie-bubble::after {',
        '  content: "";',
        '  position: absolute;',
        '  bottom: -6px;',
        '  left: 50%;',
        '  transform: translateX(-50%) rotate(45deg);',
        '  width: 10px;',
        '  height: 10px;',
        '  background: #0b0f0d;',
        '  border-right: 1px solid rgba(57,255,20,0.35);',
        '  border-bottom: 1px solid rgba(57,255,20,0.35);',
        '}',

        '#froggie-bubble.visible {',
        '  opacity: 1;',
        '  transform: translateY(0) scale(1);',
        '  pointer-events: auto;',
        '}',

        '#froggie-bubble a {',
        '  color: #39FF14;',
        '  text-decoration: underline;',
        '  font-weight: 600;',
        '}',

        '#froggie-bubble-text { display: block; }',

        '/* ─── Animations ─── */',
        '@keyframes froggie-breathe {',
        '  0%, 100% { transform: scale(1); }',
        '  50% { transform: scale(1.035); }',
        '}',

        '@keyframes froggie-bob {',
        '  0%, 100% { margin-top: 0; }',
        '  50% { margin-top: -6px; }',
        '}',

        '@keyframes froggie-shadow-pulse {',
        '  0%, 100% { transform: scaleX(1); opacity: 0.6; }',
        '  50% { transform: scaleX(0.85); opacity: 0.4; }',
        '}',

        '@keyframes froggie-jump {',
        '  0% { transform: translateY(0) scale(1); }',
        '  30% { transform: translateY(-20px) scale(1.08); }',
        '  50% { transform: translateY(-25px) scale(1.1); }',
        '  70% { transform: translateY(-10px) scale(1.05); }',
        '  100% { transform: translateY(0) scale(1); }',
        '}',

        '@keyframes froggie-bounce-in {',
        '  0% { transform: scale(0) translateY(60px); opacity: 0; }',
        '  50% { transform: scale(1.15) translateY(-10px); opacity: 1; }',
        '  70% { transform: scale(0.95) translateY(3px); }',
        '  100% { transform: scale(1) translateY(0); opacity: 1; }',
        '}',

        '@keyframes froggie-wiggle {',
        '  0%, 100% { transform: rotate(0deg) scale(1.035); }',
        '  25% { transform: rotate(-5deg) scale(1.035); }',
        '  75% { transform: rotate(5deg) scale(1.035); }',
        '}',

        '/* ─── Mobile ─── */',
        '@media (max-width: 768px) {',
        '  #froggie-pet { bottom: 12px; right: 12px; }',
        '  #froggie-bubble { max-width: 180px; font-size: 10px; padding: 6px 10px; }',
        '}'
    ].join('\n');

    document.head.appendChild(style);

    /* ─── Pose management ─── */
    function setPose(pose, animate) {
        if (!POSES[pose]) return;
        currentPose = pose;
        if (animate) {
            img.style.opacity = '0';
            setTimeout(function () {
                img.src = POSES[pose];
                img.style.opacity = '1';
            }, 150);
        } else {
            img.src = POSES[pose];
        }
    }

    /* ─── Speech bubble ─── */
    function showBubble(msg) {
        if (isDragging) return;
        clearTimeout(bubbleTimeout);

        if (msg.link) {
            bubbleText.innerHTML = msg.text + ' <a href="' + msg.link + '" target="_blank" rel="noopener">Join →</a>';
        } else {
            bubbleText.textContent = msg.text;
        }
        bubble.classList.add('visible');

        bubbleTimeout = setTimeout(function () {
            bubble.classList.remove('visible');
        }, 4500);
    }

    function showRandomBubble() {
        var idx = Math.floor(Math.random() * MESSAGES.length);
        showBubble(MESSAGES[idx]);
    }

    /* ─── Hover ─── */
    function onMouseEnter() {
        if (isDragging) return;
        isHovered = true;
        setPose('happy', true);
        imgWrap.style.animation = 'froggie-wiggle 0.6s ease-in-out 2, froggie-breathe 3s ease-in-out infinite, froggie-bob 4s ease-in-out infinite';
    }

    function onMouseLeave() {
        isHovered = false;
        imgWrap.style.animation = 'froggie-breathe 3s ease-in-out infinite, froggie-bob 4s ease-in-out infinite';
        // Revert to page mood after a beat
        setTimeout(function () {
            if (!isHovered && !isDragging) {
                setPose(detectPageMood(), true);
            }
        }, 800);
    }

    /* ─── Click ─── */
    function onClick(e) {
        if (isDragging) return;
        // Jump animation
        imgWrap.style.animation = 'froggie-jump 0.5s ease-out, froggie-breathe 3s ease-in-out infinite, froggie-bob 4s ease-in-out infinite';
        setPose('thumbsup', true);
        showRandomBubble();

        // Reset animation after it plays
        setTimeout(function () {
            imgWrap.style.animation = 'froggie-breathe 3s ease-in-out infinite, froggie-bob 4s ease-in-out infinite';
            if (!isHovered) {
                setTimeout(function () {
                    setPose(detectPageMood(), true);
                }, 2000);
            }
        }, 600);
    }

    /* ─── Drag ─── */
    var dragStartX, dragStartY, startLeft, startBottom, startRight, startTop;
    var hasMoved = false;
    var clickThreshold = 5;

    function startDrag(e) {
        e.preventDefault();
        var touch = e.touches ? e.touches[0] : e;
        isDragging = false; // not yet until moved
        hasMoved = false;

        var rect = container.getBoundingClientRect();
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;
        startLeft = rect.left;
        startTop = rect.top;

        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('touchend', endDrag);

        imgWrap.style.cursor = 'grabbing';
    }

    function moveDrag(e) {
        e.preventDefault();
        var touch = e.touches ? e.touches[0] : e;
        var dx = touch.clientX - dragStartX;
        var dy = touch.clientY - dragStartY;

        if (!hasMoved && Math.abs(dx) < clickThreshold && Math.abs(dy) < clickThreshold) return;
        hasMoved = true;
        isDragging = true;

        // Switch to absolute positioning for dragging
        container.style.position = 'fixed';
        container.style.left = (startLeft + dx) + 'px';
        container.style.top = (startTop + dy) + 'px';
        container.style.right = 'auto';
        container.style.bottom = 'auto';

        // Hide bubble while dragging
        bubble.classList.remove('visible');
    }

    function endDrag(e) {
        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('touchend', endDrag);
        imgWrap.style.cursor = 'grab';

        if (hasMoved) {
            // Keep dropped position — clamp to viewport
            var rect = container.getBoundingClientRect();
            var x = Math.max(0, Math.min(rect.left, window.innerWidth - rect.width));
            var y = Math.max(0, Math.min(rect.top, window.innerHeight - rect.height));
            container.style.left = x + 'px';
            container.style.top = y + 'px';
        } else {
            // It was a click, not a drag
            onClick(e);
        }

        setTimeout(function () { isDragging = false; }, 50);
    }

    /* ─── Mood cycling (random idle pose swap) ─── */
    function startMoodCycle() {
        function cycle() {
            var delay = 15000 + Math.random() * 20000; // 15-35s
            moodCycleTimer = setTimeout(function () {
                if (!isHovered && !isDragging) {
                    var poses = ['chill', 'happy', 'thinking', 'swag', 'salute', 'thumbsup'];
                    var pick = poses[Math.floor(Math.random() * poses.length)];
                    setPose(pick, true);

                    // Revert to page mood after 5s
                    setTimeout(function () {
                        if (!isHovered && !isDragging) {
                            setPose(detectPageMood(), true);
                        }
                    }, 5000);
                }
                cycle();
            }, delay);
        }
        cycle();
    }

    /* ─── Idle speech bubbles ─── */
    function startIdleBubbles() {
        function schedule() {
            var delay = 25000 + Math.random() * 30000; // 25-55s
            idleBubbleTimer = setTimeout(function () {
                if (!isDragging && !bubble.classList.contains('visible')) {
                    showRandomBubble();
                }
                schedule();
            }, delay);
        }
        schedule();
    }

    /* ─── Scroll speed reaction ─── */
    function onScroll() {
        var speed = Math.abs(window.scrollY - lastScrollY);
        lastScrollY = window.scrollY;

        if (speed > 120 && !isHovered && !isDragging) {
            clearTimeout(scrollSpeedTimer);
            setPose('stress', true);
            scrollSpeedTimer = setTimeout(function () {
                if (!isHovered && !isDragging) {
                    setPose(detectPageMood(), true);
                }
            }, 2000);
        }
    }

    /* ─── Entrance animation ─── */
    function enter() {
        container.style.opacity = '0';
        container.style.transform = 'scale(0) translateY(60px)';
        document.body.appendChild(container);

        // Trigger entrance after a short delay
        setTimeout(function () {
            container.style.transition = 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
            container.style.opacity = '1';
            container.style.transform = 'scale(1) translateY(0)';
        }, 800);

        // Show greeting bubble shortly after entrance
        setTimeout(function () {
            showBubble({ text: "👋 Hi! I'm Froggie, your MUBA buddy!" });
        }, 2200);
    }

    /* ─── Event listeners ─── */
    imgWrap.addEventListener('mouseenter', onMouseEnter);
    imgWrap.addEventListener('mouseleave', onMouseLeave);
    imgWrap.addEventListener('mousedown', startDrag);
    imgWrap.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ─── Initialize ─── */
    enter();
    startMoodCycle();
    startIdleBubbles();

    /* ─── Cleanup on page hide (performance) ─── */
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            clearTimeout(moodCycleTimer);
            clearTimeout(idleBubbleTimer);
            clearTimeout(scrollSpeedTimer);
        } else {
            startMoodCycle();
            startIdleBubbles();
        }
    });

})();
