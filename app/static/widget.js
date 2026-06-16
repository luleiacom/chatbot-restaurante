(function () {
  // Al dejar esto vacío, el chat se conecta automáticamente a la URL donde está alojada tu web
  const CHATBOT_URL = ""; 
  let sessionId = null;
  let isOpen = false;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

    .toggle-wrapper { position: fixed; bottom: 28px; right: 28px; z-index: 9999; }
    #chatbot-toggle { width: 56px; height: 56px; border-radius: 50%; background: #111110; color: white; border: none; font-size: 22px; cursor: pointer; box-shadow: 0 4px 24px rgba(0,0,0,0.15); transition: transform 0.2s, opacity 0.2s; }
    #chatbot-toggle:hover { transform: scale(1.06); opacity: 0.85; }
    .notification-badge { position: absolute; top: -4px; right: -4px; width: 14px; height: 14px; background: #e05555; border-radius: 50%; border: 2px solid #fafaf8; display: none; }
    #chatbot-window { position: fixed; bottom: 100px; right: 28px; width: min(360px, calc(100vw - 32px)); height: min(540px, 75vh); background: #fafaf8; border-radius: 20px; box-shadow: 0 12px 48px rgba(0,0,0,0.12); display: flex; flex-direction: column; z-index: 9998; overflow: hidden; opacity: 0; pointer-events: none; transform: translateY(12px); transition: opacity 0.25s, transform 0.25s; font-family: 'DM Sans', sans-serif; }
    #chatbot-window.open { opacity: 1; pointer-events: all; transform: translateY(0); }
    @media (max-width: 480px) { #chatbot-window { bottom: 0; right: 0; left: 0; width: 100%; height: 85vh; border-radius: 20px 20px 0 0; } }
    #chatbot-header { background: #111110; color: #fafaf8; padding: 18px 22px; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    #chatbot-header .dot { width: 8px; height: 8px; background: #a8d5b5; border-radius: 50%; }
    #chatbot-header .header-actions { display: flex; gap: 12px; margin-left: auto; }
    #chatbot-header .header-actions button { background: none; border: none; color: #fafaf8; cursor: pointer; opacity: 0.5; }
    #chatbot-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; background: #fafaf8; }
    .msg { max-width: 82%; padding: 11px 15px; border-radius: 16px; font-size: 14px; line-height: 1.55; }
    .msg.bot { background: #fff; border: 1px solid #e8e8e4; align-self: flex-start; border-bottom-left-radius: 4px; color: #111110; }
    .msg.user { background: #111110; color: #fafaf8; align-self: flex-end; border-bottom-right-radius: 4px; }
    .quick-replies { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 14px; }
    .quick-reply-btn { background: #fff; border: 1px solid #e8e8e4; border-radius: 100px; padding: 8px 14px; font-size: 13px; cursor: pointer; }
    #chatbot-input-area { display: flex; padding: 14px; gap: 10px; border-top: 1px solid #e8e8e4; background: #fff; }
    #chatbot-input { flex: 1; border: 1px solid #e8e8e4; border-radius: 100px; padding: 10px 18px; outline: none; background: #fafaf8; }
    #chatbot-send { background: #111110; color: white; border: none; border-radius: 50%; width: 38px; height: 38px; cursor: pointer; }
  `;

  document.head.appendChild(document.createElement("style")).textContent = styles;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="toggle-wrapper"><button id="chatbot-toggle">💬</button><div class="notification-badge" id="notif-badge"></div></div>
    <div id="chatbot-window">
      <div id="chatbot-header"><span class="dot"></span><span>Asistente Virtual</span><div class="header-actions"><button id="chatbot-minimize">—</button><button id="chatbot-close">✕</button></div></div>
      <div id="chatbot-messages"></div>
      <div id="quick-replies-container" class="quick-replies"></div>
      <div id="chatbot-input-area"><input id="chatbot-input" type="text" placeholder="Escribí tu consulta..." /><button id="chatbot-send">➤</button></div>
    </div>
  `);

  const toggle = document.getElementById("chatbot-toggle"), window_ = document.getElementById("chatbot-window"), messages = document.getElementById("chatbot-messages"), input = document.getElementById("chatbot-input"), sendBtn = document.getElementById("chatbot-send"), badge = document.getElementById("notif-badge"), quickRepliesContainer = document.getElementById("quick-replies-container");
  
  const QUICK_REPLIES = [{ label: "🍽️ Ver menú", text: "¿Cuál es el menú?" }, { label: "🕐 Horarios", text: "¿Cuáles son los horarios de atención?" }, { label: "📅 Reservar", text: "Quiero hacer una reserva" }, { label: "📍 Ubicación", text: "¿Dónde están ubicados?" }];

  function addMessage(text, role) { const div = document.createElement("div"); div.className = `msg ${role}`; div.textContent = text; messages.appendChild(div); messages.scrollTop = messages.scrollHeight; }

  async function sendMessageWithText(text) {
    if (!text.trim()) return;
    quickRepliesContainer.innerHTML = "";
    addMessage(text, "user");
    try {
      // Usamos ruta relativa /chat
      const res = await fetch(`${CHATBOT_URL}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, message: text }) });
      const data = await res.json(); sessionId = data.session_id; addMessage(data.response, "bot");
    } catch (e) { addMessage("Error al conectar con el servidor.", "bot"); }
  }

  toggle.addEventListener("click", () => {
    isOpen = !isOpen; badge.style.display = "none"; window_.classList.toggle("open", isOpen); toggle.textContent = isOpen ? "✕" : "💬";
    if (isOpen && messages.children.length === 0) {
      addMessage("¡Hola! 👋 Soy el asistente de La Parrilla del Centro. ¿En qué te puedo ayudar?", "bot");
      QUICK_REPLIES.forEach(({ label, text }) => { const btn = document.createElement("button"); btn.className = "quick-reply-btn"; btn.textContent = label; btn.addEventListener("click", () => sendMessageWithText(text)); quickRepliesContainer.appendChild(btn); });
    }
  });

  sendBtn.addEventListener("click", () => { const text = input.value.trim(); if(text) { input.value = ""; sendMessageWithText(text); } });
  document.getElementById("chatbot-minimize").addEventListener("click", () => { isOpen = false; window_.classList.remove("open"); toggle.textContent = "💬"; });
  document.getElementById("chatbot-close").addEventListener("click", () => { isOpen = false; window_.classList.remove("open"); toggle.textContent = "💬"; });
})();