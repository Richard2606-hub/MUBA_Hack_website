/**
 * ============================================================
 *  MUBA Froggie — Living Mascot Pet & Gemini AI Companion
 *  Self-contained script. Loaded by global.js on every page.
 * ============================================================
 */
(function () {
    'use strict';

    /* ─── Gemini AI Configuration ─── */
    var GEMINI_API_KEY = atob('QVEuQWI4Uk42TGtpeG43UkVLMW1nd3E3YWo2aGwxM2J5MktzTHFlUWtZVnpZQ1E0Nmdob0E=');
    var PRIMARY_MODEL = 'gemini-2.5-flash';
    var FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    var FROGGIE_SYSTEM_PROMPT = 
        "You are Froggie 🐸, the official enthusiastic, friendly AI pet mascot for the MUBA Blockchain Hackathon 2026! " +
        "You speak like a helpful, cheerful frog companion (use occasional frog sounds like 'Ribbit!', '*hops*', 'Ribbit ribbit!'). " +
        "Keep your answers helpful, friendly, and concise (1-3 short paragraphs max).\n\n" +
        "KEY MUBA HACKATHON 2026 INFO TO USE IN YOUR ANSWERS:\n" +
        "- Total Prize Pool: RM 42,000 (1st: RM 15,000, 2nd: RM 10,000, 3rd: RM 6,000, 4th-5th: RM 2,000 each, Track Bounties: RM 7,000).\n" +
        "- Tracks: Sui (Move dApps/Smart contracts), Thetanuts Finance (DeFi / Options), Gonka Router (Infra & Interoperability), AI x Web3 / Consumer.\n" +
        "- Eligibility: Open to all Malaysian citizens and valid Malaysian visa/pass holders (students, developers, fresh grads).\n" +
        "- Teammates: Find team members on Discord at https://discord.gg/2WrGAwpWVW in the #find-teammates channel.\n" +
        "- Official Links: Discord: https://discord.gg/2WrGAwpWVW, Instagram: @muba_hack_, Twitter/X: @muba_hack_.\n" +
        "- Registration: Open now on Devfolio! Encouraged to register early.";

    /* ─── Asset paths ─── */
    var scriptTag = document.querySelector('script[src*="froggie.js"]');
    var basePath = scriptTag
        ? scriptTag.src.replace(/froggie\.js.*$/, '')
        : '../assets/';
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
        'track-details':         'stress'
    };

    function detectPageMood() {
        var path = window.location.pathname.toLowerCase();
        var keys = Object.keys(pageMoods);
        for (var i = 0; i < keys.length; i++) {
            if (path.indexOf(keys[i]) !== -1) return pageMoods[keys[i]];
        }
        return 'happy';
    }

    /* ─── Speech bubble messages ─── */
    var MESSAGES = [
        { text: "💬 Chat with me! Click me to ask AI Froggie anything!" },
        { text: "🤝 Need teammates? Join our Discord!", link: "https://discord.gg/2WrGAwpWVW" },
        { text: "⏰ Registration closes soon — don't miss out!" },
        { text: "🏆 RM42,000 in prizes up for grabs!" },
        { text: "💡 Ask me about Challenge Tracks or Prizes!" },
        { text: "🇲🇾 Open to Malaysian citizens & visa holders!" },
        { text: "👋 Hi! I'm Froggie, your MUBA AI buddy!" },
        { text: "🐸 *ribbit* Click me to open AI Chat!" }
    ];

    /* ─── State ─── */
    var currentPose = detectPageMood();
    var isDragging = false;
    var isHovered = false;
    var isChatOpen = false;
    var isThinking = false;
    var bubbleTimeout = null;
    var moodCycleTimer = null;
    var idleBubbleTimer = null;
    var lastScrollY = 0;
    var scrollSpeedTimer = null;
    var conversationHistory = [];
    var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

    /* ─── Create DOM Elements ─── */
    var container = document.createElement('div');
    container.id = 'froggie-pet';
    container.setAttribute('aria-label', 'MUBA Froggie mascot pet');

    // Speech bubble
    var bubble = document.createElement('div');
    bubble.id = 'froggie-bubble';

    var bubbleText = document.createElement('span');
    bubbleText.id = 'froggie-bubble-text';
    bubble.appendChild(bubbleText);

    // AI Chat Window
    var chatWindow = document.createElement('div');
    chatWindow.id = 'froggie-chat-window';
    chatWindow.innerHTML = [
        '<div id="froggie-chat-header">',
        '  <div class="froggie-chat-title">',
        '    <span class="froggie-avatar">🐸</span>',
        '    <div>',
        '      <div style="font-weight: 700; color: #fff; font-size: 13px;">Froggie AI Assistant</div>',
        '      <div style="font-size: 10px; color: #39FF14; display: flex; align-items: center; gap: 4px;">',
        '        <span style="display:inline-block; width:6px; height:6px; background:#39FF14; border-radius:50%;"></span> Powered by Gemini AI',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <button id="froggie-chat-close" title="Close chat">&times;</button>',
        '</div>',
        '<div id="froggie-chat-body">',
        '  <div class="froggie-msg froggie-msg-assistant">',
        '    Ribbit! 🐸 Hi! I\'m Froggie, your AI pet companion for MUBA Hackathon 2026! Ask me anything about tracks, prize pool, rules, or how to find a team!',
        '  </div>',
        '  <div id="froggie-chips">',
        '    <button class="froggie-chip" data-prompt="What is the Prize Pool for MUBA 2026?">🏆 Prize Pool</button>',
        '    <button class="froggie-chip" data-prompt="What are the Challenge Tracks?">💡 Tracks</button>',
        '    <button class="froggie-chip" data-prompt="How do I find a team?">🤝 Find Team</button>',
        '    <button class="froggie-chip" data-prompt="Who is eligible to participate?">🇲🇾 Eligibility</button>',
        '  </div>',
        '</div>',
        '<div id="froggie-chat-input-row">',
        '  <input type="text" id="froggie-chat-input" placeholder="Ask Froggie anything about MUBA..." autocomplete="off" />',
        '  <button id="froggie-chat-send" title="Send message">&#10148;</button>',
        '</div>'
    ].join('');

    // Froggie image wrapper
    var imgWrap = document.createElement('div');
    imgWrap.id = 'froggie-img-wrap';

    var img = document.createElement('img');
    img.id = 'froggie-img';
    img.src = POSES[currentPose];
    img.alt = 'MUBA Froggie';
    img.draggable = false;

    // Shadow
    var shadow = document.createElement('div');
    shadow.id = 'froggie-shadow';

    imgWrap.appendChild(img);
    container.appendChild(chatWindow);
    container.appendChild(bubble);
    container.appendChild(imgWrap);
    container.appendChild(shadow);

    /* ─── Inject Styles ─── */
    var style = document.createElement('style');
    style.textContent = [
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
        '  width: ' + (isMobile ? '70px' : '95px') + ';',
        '  height: ' + (isMobile ? '70px' : '95px') + ';',
        '  cursor: pointer;',
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

        '/* Speech Bubble */',
        '#froggie-bubble {',
        '  position: relative;',
        '  background: #0b0f0d;',
        '  border: 1px solid rgba(57,255,20,0.4);',
        '  border-radius: 12px;',
        '  padding: 8px 14px;',
        '  margin-bottom: 8px;',
        '  max-width: 230px;',
        '  font-family: "JetBrains Mono", monospace;',
        '  font-size: 11px;',
        '  color: #cbd5e1;',
        '  line-height: 1.45;',
        '  box-shadow: 0 0 20px rgba(57,255,20,0.15), 0 4px 20px rgba(0,0,0,0.5);',
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
        '  border-right: 1px solid rgba(57,255,20,0.4);',
        '  border-bottom: 1px solid rgba(57,255,20,0.4);',
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

        '/* AI Chat Window */',
        '#froggie-chat-window {',
        '  display: none;',
        '  position: absolute;',
        '  bottom: 110px;',
        '  right: 0;',
        '  width: 320px;',
        '  max-width: 90vw;',
        '  height: 400px;',
        '  max-height: 70vh;',
        '  background: rgba(11, 15, 13, 0.96);',
        '  backdrop-filter: blur(20px);',
        '  -webkit-backdrop-filter: blur(20px);',
        '  border: 1px solid rgba(57, 255, 20, 0.3);',
        '  border-radius: 16px;',
        '  box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 30px rgba(57,255,20,0.15);',
        '  flex-direction: column;',
        '  overflow: hidden;',
        '  opacity: 0;',
        '  transform: translateY(15px) scale(0.95);',
        '  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);',
        '}',

        '#froggie-chat-window.open {',
        '  display: flex;',
        '  opacity: 1;',
        '  transform: translateY(0) scale(1);',
        '}',

        '#froggie-chat-header {',
        '  background: rgba(20, 30, 24, 0.9);',
        '  padding: 12px 16px;',
        '  border-bottom: 1px solid rgba(255, 255, 255, 0.08);',
        '  display: flex;',
        '  justify-content: space-between;',
        '  align-items: center;',
        '}',

        '.froggie-chat-title { display: flex; align-items: center; gap: 10px; }',
        '.froggie-avatar { font-size: 20px; }',

        '#froggie-chat-close {',
        '  background: transparent;',
        '  border: none;',
        '  color: #94a3b8;',
        '  font-size: 20px;',
        '  cursor: pointer;',
        '  padding: 0 4px;',
        '  line-height: 1;',
        '}',

        '#froggie-chat-close:hover { color: #fff; }',

        '#froggie-chat-body {',
        '  flex: 1;',
        '  padding: 14px;',
        '  overflow-y: auto;',
        '  display: flex;',
        '  flex-direction: column;',
        '  gap: 10px;',
        '  font-family: "Plus Jakarta Sans", sans-serif;',
        '  font-size: 12px;',
        '  color: #e2e8f0;',
        '  scrollbar-width: thin;',
        '  scrollbar-color: rgba(57,255,20,0.3) transparent;',
        '}',

        '.froggie-msg {',
        '  max-width: 85%;',
        '  padding: 10px 14px;',
        '  border-radius: 12px;',
        '  line-height: 1.5;',
        '  word-break: break-word;',
        '}',

        '.froggie-msg-assistant {',
        '  align-self: flex-start;',
        '  background: rgba(255,255,255,0.06);',
        '  border: 1px solid rgba(57,255,20,0.25);',
        '  color: #f1f5f9;',
        '  border-bottom-left-radius: 2px;',
        '}',

        '.froggie-msg-user {',
        '  align-self: flex-end;',
        '  background: linear-gradient(135deg, #7c3aed, #4f46e5);',
        '  color: #fff;',
        '  border-bottom-right-radius: 2px;',
        '}',

        '#froggie-chips {',
        '  display: flex;',
        '  flex-wrap: wrap;',
        '  gap: 6px;',
        '  margin-top: 4px;',
        '}',

        '.froggie-chip {',
        '  background: rgba(57,255,20,0.1);',
        '  border: 1px solid rgba(57,255,20,0.3);',
        '  color: #39FF14;',
        '  padding: 5px 10px;',
        '  border-radius: 20px;',
        '  font-size: 10.5px;',
        '  cursor: pointer;',
        '  transition: all 0.2s ease;',
        '}',

        '.froggie-chip:hover {',
        '  background: rgba(57,255,20,0.25);',
        '  transform: translateY(-1px);',
        '}',

        '#froggie-chat-input-row {',
        '  padding: 10px 12px;',
        '  background: rgba(15, 23, 18, 0.95);',
        '  border-top: 1px solid rgba(255,255,255,0.08);',
        '  display: flex;',
        '  gap: 8px;',
        '}',

        '#froggie-chat-input {',
        '  flex: 1;',
        '  background: rgba(0,0,0,0.4);',
        '  border: 1px solid rgba(255,255,255,0.15);',
        '  border-radius: 20px;',
        '  padding: 8px 14px;',
        '  color: #fff;',
        '  font-size: 12px;',
        '  outline: none;',
        '}',

        '#froggie-chat-input:focus { border-color: #39FF14; }',

        '#froggie-chat-send {',
        '  background: #39FF14;',
        '  color: #000;',
        '  border: none;',
        '  border-radius: 50%;',
        '  width: 32px;',
        '  height: 32px;',
        '  cursor: pointer;',
        '  font-weight: bold;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  transition: transform 0.2s ease;',
        '}',

        '#froggie-chat-send:hover { transform: scale(1.1); }',

        '/* Keyframes */',
        '@keyframes froggie-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.035); } }',
        '@keyframes froggie-bob { 0%, 100% { margin-top: 0; } 50% { margin-top: -6px; } }',
        '@keyframes froggie-shadow-pulse { 0%, 100% { transform: scaleX(1); opacity: 0.6; } 50% { transform: scaleX(0.85); opacity: 0.4; } }',
        '@keyframes froggie-jump { 0% { transform: translateY(0); } 40% { transform: translateY(-22px); } 100% { transform: translateY(0); } }',
        '@keyframes froggie-wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }',

        '/* Mobile */',
        '@media (max-width: 768px) {',
        '  #froggie-pet { bottom: 12px; right: 12px; }',
        '  #froggie-chat-window { width: 290px; bottom: 85px; right: 0; }',
        '}'
    ].join('\n');

    document.head.appendChild(style);

    /* ─── Pose Functions ─── */
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

    /* ─── Speech Bubble Functions ─── */
    function showBubble(msg) {
        if (isDragging || isChatOpen) return;
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

    /* ─── Toggle Chat Window ─── */
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            bubble.classList.remove('visible');
            chatWindow.classList.add('open');
            setPose('happy', true);
            setTimeout(function () {
                var input = document.getElementById('froggie-chat-input');
                if (input) input.focus();
            }, 300);
        } else {
            chatWindow.classList.remove('open');
            setPose(detectPageMood(), true);
        }
    }

    /* ─── Render Links in Text ─── */
    function formatMessage(text) {
        var html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        html = html.replace(/(https?:\/\/[^\s]+)/g, function (url) {
            return '<a href="' + url + '" target="_blank" rel="noopener" style="color:#39FF14; text-decoration:underline;">' + url + '</a>';
        });

        return html.replace(/\n/g, '<br>');
    }

    /* ─── Add Chat Message to UI ─── */
    function addChatMessage(sender, text) {
        var chatBody = document.getElementById('froggie-chat-body');
        if (!chatBody) return;

        var msgDiv = document.createElement('div');
        msgDiv.className = 'froggie-msg ' + (sender === 'user' ? 'froggie-msg-user' : 'froggie-msg-assistant');
        msgDiv.innerHTML = formatMessage(text);

        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    /* ─── Fallback Pre-scripted Knowledge Answers ─── */
    function getFallbackAnswer(prompt) {
        var p = prompt.toLowerCase();
        if (p.indexOf('prize') !== -1 || p.indexOf('reward') !== -1 || p.indexOf('money') !== -1) {
            return "Ribbit! 🏆 Total prize pool is RM 42,000!\n- 1st Place: RM 15,000\n- 2nd Place: RM 10,000\n- 3rd Place: RM 6,000\n- 4th-5th: RM 2,000 each\n- Track Bounties: RM 7,000!";
        }
        if (p.indexOf('track') !== -1 || p.indexOf('challenge') !== -1 || p.indexOf('sui') !== -1) {
            return "Ribbit! 💡 We have 4 exciting tracks:\n1. Sui (Move Smart Contracts & Ecosystem)\n2. Thetanuts Finance (DeFi / Options)\n3. Gonka Router (Infra & Interoperability)\n4. AI x Web3 / Consumer Applications!";
        }
        if (p.indexOf('team') !== -1 || p.indexOf('discord') !== -1 || p.indexOf('match') !== -1) {
            return "Ribbit! 🤝 Join our official Discord to find teammates in the #find-teammates channel! https://discord.gg/2WrGAwpWVW";
        }
        if (p.indexOf('eligible') !== -1 || p.indexOf('who') !== -1 || p.indexOf('visa') !== -1 || p.indexOf('student') !== -1) {
            return "Ribbit! 🇲🇾 MUBA Hackathon 2026 is open to all Malaysian citizens and valid Malaysian visa/pass holders (students, developers, fresh grads)!";
        }
        if (p.indexOf('register') !== -1 || p.indexOf('apply') !== -1 || p.indexOf('devfolio') !== -1) {
            return "Ribbit! ⚡ Registration is open on Devfolio! Click the 'Register with Devfolio' button at the top navigation bar to sign up!";
        }
        return "Ribbit! 🐸 I'm your MUBA Hackathon AI assistant! You can ask me about tracks, total prize pool (RM 42k!), Discord teammate matching, or eligibility rules!";
    }

    /* ─── Gemini API Integration ─── */
    function callGeminiAI(userPrompt) {
        if (isThinking) return;
        isThinking = true;

        addChatMessage('user', userPrompt);
        setPose('thinking', true);

        conversationHistory.push({ role: 'user', parts: [{ text: userPrompt }] });

        var chatBody = document.getElementById('froggie-chat-body');
        var typingDiv = document.createElement('div');
        typingDiv.id = 'froggie-typing';
        typingDiv.className = 'froggie-msg froggie-msg-assistant';
        typingDiv.style.fontStyle = 'italic';
        typingDiv.style.opacity = '0.7';
        typingDiv.textContent = 'Froggie is thinking... 🐸';
        if (chatBody) {
            chatBody.appendChild(typingDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        var requestPayload = {
            systemInstruction: {
                parts: [{ text: FROGGIE_SYSTEM_PROMPT }]
            },
            contents: conversationHistory,
            generationConfig: {
                maxOutputTokens: 350,
                temperature: 0.7
            }
        };

        function attemptModel(modelsList, index) {
            if (index >= modelsList.length) {
                if (typingDiv && typingDiv.parentNode) typingDiv.parentNode.removeChild(typingDiv);
                var fallbackReply = getFallbackAnswer(userPrompt);
                addChatMessage('assistant', fallbackReply);
                conversationHistory.push({ role: 'model', parts: [{ text: fallbackReply }] });
                setPose('happy', true);
                isThinking = false;
                return;
            }

            var modelName = modelsList[index];
            var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + GEMINI_API_KEY;

            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            var reply = response.candidates[0].content.parts[0].text;
                            if (typingDiv && typingDiv.parentNode) typingDiv.parentNode.removeChild(typingDiv);
                            
                            addChatMessage('assistant', reply);
                            conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
                            
                            setPose('swag', true);
                            setTimeout(function () { setPose('happy', true); }, 2000);
                        } catch (e) {
                            attemptModel(modelsList, index + 1);
                        }
                    } else {
                        attemptModel(modelsList, index + 1);
                    }
                    isThinking = false;
                }
            };

            xhr.onerror = function () {
                attemptModel(modelsList, index + 1);
            };

            xhr.send(JSON.stringify(requestPayload));
        }

        var allModels = [PRIMARY_MODEL].concat(FALLBACK_MODELS);
        attemptModel(allModels, 0);
    }

    /* ─── Event Handlers ─── */
    function onMouseEnter() {
        if (isDragging || isChatOpen) return;
        isHovered = true;
        setPose('happy', true);
        imgWrap.style.animation = 'froggie-wiggle 0.6s ease-in-out 2, froggie-breathe 3s ease-in-out infinite, froggie-bob 4s ease-in-out infinite';
    }

    function onMouseLeave() {
        if (isChatOpen) return;
        isHovered = false;
        imgWrap.style.animation = 'froggie-breathe 3s ease-in-out infinite, froggie-bob 4s ease-in-out infinite';
        setTimeout(function () {
            if (!isHovered && !isDragging && !isChatOpen) {
                setPose(detectPageMood(), true);
            }
        }, 800);
    }

    function onClick(e) {
        if (isDragging) return;
        imgWrap.style.animation = 'froggie-jump 0.4s ease-out, froggie-breathe 3s ease-in-out infinite, froggie-bob 4s ease-in-out infinite';
        toggleChat();
    }

    /* ─── Drag Support ─── */
    var dragStartX, dragStartY, startLeft, startTop;
    var hasMoved = false;
    var clickThreshold = 5;

    function startDrag(e) {
        if (e.target.closest('#froggie-chat-window')) return;
        var touch = e.touches ? e.touches[0] : e;
        isDragging = false;
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
    }

    function moveDrag(e) {
        var touch = e.touches ? e.touches[0] : e;
        var dx = touch.clientX - dragStartX;
        var dy = touch.clientY - dragStartY;

        if (!hasMoved && Math.abs(dx) < clickThreshold && Math.abs(dy) < clickThreshold) return;
        hasMoved = true;
        isDragging = true;

        container.style.position = 'fixed';
        container.style.left = (startLeft + dx) + 'px';
        container.style.top = (startTop + dy) + 'px';
        container.style.right = 'auto';
        container.style.bottom = 'auto';

        bubble.classList.remove('visible');
    }

    function endDrag(e) {
        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('touchend', endDrag);

        if (hasMoved) {
            var rect = container.getBoundingClientRect();
            var x = Math.max(0, Math.min(rect.left, window.innerWidth - rect.width));
            var y = Math.max(0, Math.min(rect.top, window.innerHeight - rect.height));
            container.style.left = x + 'px';
            container.style.top = y + 'px';
        } else {
            onClick(e);
        }

        setTimeout(function () { isDragging = false; }, 50);
    }

    /* ─── Mood Cycling & Idle Speech ─── */
    function startMoodCycle() {
        function cycle() {
            var delay = 15000 + Math.random() * 20000;
            moodCycleTimer = setTimeout(function () {
                if (!isHovered && !isDragging && !isChatOpen) {
                    var poses = ['chill', 'happy', 'thinking', 'swag', 'salute', 'thumbsup'];
                    var pick = poses[Math.floor(Math.random() * poses.length)];
                    setPose(pick, true);

                    setTimeout(function () {
                        if (!isHovered && !isDragging && !isChatOpen) {
                            setPose(detectPageMood(), true);
                        }
                    }, 5000);
                }
                cycle();
            }, delay);
        }
        cycle();
    }

    function startIdleBubbles() {
        function schedule() {
            var delay = 25000 + Math.random() * 30000;
            idleBubbleTimer = setTimeout(function () {
                if (!isDragging && !isChatOpen && !bubble.classList.contains('visible')) {
                    showRandomBubble();
                }
                schedule();
            }, delay);
        }
        schedule();
    }

    function onScroll() {
        var speed = Math.abs(window.scrollY - lastScrollY);
        lastScrollY = window.scrollY;

        if (speed > 120 && !isHovered && !isDragging && !isChatOpen) {
            clearTimeout(scrollSpeedTimer);
            setPose('stress', true);
            scrollSpeedTimer = setTimeout(function () {
                if (!isHovered && !isDragging && !isChatOpen) {
                    setPose(detectPageMood(), true);
                }
            }, 2000);
        }
    }

    function enter() {
        container.style.opacity = '0';
        container.style.transform = 'scale(0) translateY(60px)';
        document.body.appendChild(container);

        setTimeout(function () {
            container.style.transition = 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
            container.style.opacity = '1';
            container.style.transform = 'scale(1) translateY(0)';
        }, 800);

        setTimeout(function () {
            showBubble({ text: "💬 Hi! I'm Froggie AI! Click me to chat!" });
        }, 2200);
    }

    /* ─── Setup Listeners ─── */
    imgWrap.addEventListener('mouseenter', onMouseEnter);
    imgWrap.addEventListener('mouseleave', onMouseLeave);
    imgWrap.addEventListener('mousedown', startDrag);
    imgWrap.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Chat UI listeners
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'froggie-chat-close') {
            toggleChat();
        }
        if (e.target && e.target.id === 'froggie-chat-send') {
            var input = document.getElementById('froggie-chat-input');
            if (input && input.value.trim()) {
                callGeminiAI(input.value.trim());
                input.value = '';
            }
        }
        if (e.target && e.target.classList.contains('froggie-chip')) {
            var prompt = e.target.getAttribute('data-prompt');
            if (prompt) {
                callGeminiAI(prompt);
            }
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target && e.target.id === 'froggie-chat-input') {
            var input = e.target;
            if (input.value.trim()) {
                callGeminiAI(input.value.trim());
                input.value = '';
            }
        }
    });

    /* ─── Initialize ─── */
    enter();
    startMoodCycle();
    startIdleBubbles();

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
