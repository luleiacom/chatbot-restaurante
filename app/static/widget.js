(function () {
  // URL vacía para que use el dominio actual
  const CHATBOT_URL = ""; 
  let sessionId = null;
  let isOpen = false;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

    .toggle-wrapper {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9999;
    }
    #chatbot-toggle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #111110;
      color: white;
      border: none;
      font-size: 22px;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      transition: transform 0.2s, opacity 0.2s;
    }
    #chatbot-toggle:hover { transform: scale(1.06); opacity: 0.85; }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 14px;
      height: 14px;
      background: #e05555;
      border-radius: 50%;
      border: 2px solid #fafaf8;
      display: none;
    }

    #chatbot-window {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: min(360px, calc(100vw - 32px));
      height: min(540px, 75vh);
      background: #fafaf8;
      border-radius: 20px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      z-index: 9998;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px);
      transition: opacity 0.25s, transform 0.25s;
      font-family: 'DM Sans', sans-serif;
    }
    #chatbot-window.open {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0);
    }

    @media (max-width: 480px) {
      #chatbot-window {
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        height: 85vh;
        border-radius: 20px 20px 0 0;
      }
      .toggle-wrapper {
        bottom: 20px;
        right: 20px;
      }
    }

    #chatbot-header {
      background: #111110;
      color: #fafaf8;
      padding: 18px 22px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.2px;
      flex-shrink: 0;
    }
    #chatbot-header .dot {
      width: 8px;
      height: 8px;
      background: #a8d5b5;
      border-radius: 50%;
      flex-shrink: 0;
    }
    #chatbot-header .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-left: auto;
    }
    #chatbot-header .header-actions button {
      background: none;
      border: none;
      color: #fafaf8;
      cursor: pointer;
      opacity: 0.5;
      padding: 0;
      line-height: 1;
      font-size: 16px;
      transition: opacity 0.2s;
    }
    #chatbot-header .header-actions button:hover { opacity: 1; }

    #chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #fafaf8;
    }
    #chatbot-messages::-webkit-scrollbar { width: 0; }

    .msg {
      max-width: 82%;
      padding: 11px 15px;
      border-radius: 16px;
      line-height: 1.55;
      font-size: 14px;
      font-weight: 300;
    }
    .msg.bot {
      background: #fff;
      border: 1px solid #e8e8e4;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      color: #111110;
    }
    .msg.user {
      background: #111110;
      color: #fafaf8;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .msg.typing {
      border: 1px solid #e8e8e4;
      background: #fff;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .typing-dots {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 4px 2px;
    }
    .typing-dots span {
      width: 7px;
      height: 7px;
      background: #ccc;
      border-radius: 50%;
      animation: bounce 1.2s infinite;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    .quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0 16px 14px;
      flex-shrink: 0;
    }
    .quick-reply-btn {
      background: #fff;
      border: 1px solid #e8e8e4;
      border-radius: 100px;
      padding: 8px 14px;
      font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 400;
      color: #111110;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .quick-reply-btn:hover {
      background: #111110;
      color: #fafaf8;
      border-color: #111110;
    }

    #chatbot-input-area {
      display: flex;
      padding: 14px;
      gap: 10px;
      border-top: 1px solid #e8e8e4;
      background: #fff;
      flex-shrink: 0;
    }
    #chatbot-input {
      flex: 1;
      border: 1px solid #e8e8e4;
      border-radius: 100px;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 300;
      outline: none;
      font-family: 'DM Sans', sans-serif;
      background: #fafaf8;
      color: #111110;
    }
    #chatbot-input:focus { border-color: #111110; }
    #chatbot-input::placeholder { color: #bbb; }

    #chatbot-send {
      background: #111110;
      color: white;
      border: none;
      border-radius: 50%;
      width: 38px;
      height: 38px;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }
    #chatbot-send:hover { opacity: 0.75; }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  document.body.insertAdjacentHTML("beforeend", `
    <div class="toggle-wrapper">
      <button id="chatbot-toggle">💬</button>
      <div class="notification-badge" id="notif-badge"></div>
    </div>
    <div id="chatbot-window">
      <div id="chatbot-header">
        <span class="dot"></span>
        <span id="header-title">Asistente Virtual</span>
        <div class="header-actions">
          <button id="chatbot-minimize" title="Minimizar">—</button>
          <button id="chatbot-close" title="Cerrar">✕</button>
        </div>
      </div>
      <div id="chatbot-messages"></div>
      <div id="quick-replies-container" class="quick-replies"></div>
      <div id="chatbot-input-area">
        <input id="chatbot-input" type="text" placeholder="Escribí tu consulta..." />
        <button id="chatbot-send">➤</button>
      </div>
    </div>
  `);

  const toggle = document.getElementById("chatbot-toggle");
  const window_ = document.getElementById("chatbot-window");
  const messages = document.getElementById("chatbot-messages");
  const input = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send");
  const badge = document.getElementById("notif-badge");
  const quickRepliesContainer = document.getElementById("quick-replies-container");

  const QUICK_REPLIES = [
    { label: "🍽️ Ver menú", text: "¿Cuál es el menú?" },
    { label: "🕐 Horarios", text: "¿Cuáles son los horarios de atención?" },
    { label: "📅 Reservar", text: "Quiero hacer una reserva" },
    { label: "📍 Ubicación", text: "¿Dónde están ubicados?" },
  ];

  function showQuickReplies() {
    quickRepliesContainer.innerHTML = "";
    QUICK_REPLIES.forEach(({ label, text }) => {
      const btn = document.createElement("button");
      btn.className = "quick-reply-btn";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        hideQuickReplies();
        sendMessageWithText(text);
      });
      quickRepliesContainer.appendChild(btn);
    });
  }

  function hideQuickReplies() {
    quickRepliesContainer.innerHTML = "";
  }

  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(520, ctx.currentTime);
      oscillator.frequency.setValueAtTime(680, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }

  function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "msg bot typing";
    div.innerHTML = `
      <span class="typing-dots">
        <span></span><span></span><span></span>
      </span>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  async function sendMessageWithText(text) {
    if (!text.trim()) return;
    hideQuickReplies();
    addMessage(text, "user");
    const typingEl = showTyping();
    try {
      const res = await fetch(`${CHATBOT_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });
      const data = await res.json();
      sessionId = data.session_id;
      typingEl.remove();
      addMessage(data.response, "bot");
      playNotificationSound();
      if (!isOpen) {
        badge.style.display = "block";
      }
    } catch (e) {
      typingEl.remove();
      addMessage("Error al conectar con el servidor.", "bot");
    }
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    await sendMessageWithText(text);
  }

  function closeChat() {
    isOpen = false;
    window_.classList.remove("open");
    toggle.textContent = "💬";
  }

  toggle.addEventListener("click", () => {
    isOpen = !isOpen;
    badge.style.display = "none";
    window_.classList.toggle("open", isOpen);
    toggle.textContent = isOpen ? "✕" : "💬";
    if (isOpen && messages.children.length === 0) {
      const hora = new Date().getHours();
      let saludo = "¡Hola";
      if (hora >= 6 && hora < 12) saludo = "¡Buenos días";
      else if (hora >= 12 && hora < 20) saludo = "¡Buenas tardes";
      else saludo = "¡Buenas noches";
      addMessage(`${saludo}! 👋 Soy el asistente de La Parrilla del Centro. ¿En qué te puedo ayudar?`, "bot");
      showQuickReplies();
    }
  });

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  document.getElementById("chatbot-minimize").addEventListener("click", closeChat);
  document.getElementById("chatbot-close").addEventListener("click", closeChat);
})();