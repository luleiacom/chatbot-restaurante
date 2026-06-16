(function () {
  const CHATBOT_URL = "http://localhost:8000";
  let sessionId = null;
  let isOpen = false;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

    #chatbot-toggle {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #111110;
      color: white;
      border: none;
      font-size: 22px;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      z-index: 9999;
      transition: transform 0.2s, opacity 0.2s;
    }
    #chatbot-toggle:hover { transform: scale(1.06); opacity: 0.85; }

    #chatbot-window {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 360px;
      height: 520px;
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
    }
    #chatbot-header .dot {
      width: 8px;
      height: 8px;
      background: #a8d5b5;
      border-radius: 50%;
    }

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
      color: #aaa;
      font-style: italic;
      font-size: 13px;
    }

    #chatbot-input-area {
      display: flex;
      padding: 14px;
      gap: 10px;
      border-top: 1px solid #e8e8e4;
      background: #fff;
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
    <button id="chatbot-toggle">💬</button>
    <div id="chatbot-window">
      <div id="chatbot-header">
        <span class="dot"></span>
        Asistente Virtual
      </div>
      <div id="chatbot-messages"></div>
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

  function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    return addMessage("Escribiendo...", "bot typing");
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
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
    } catch (e) {
      typingEl.remove();
      addMessage("Error al conectar con el servidor.", "bot");
    }
  }

  toggle.addEventListener("click", () => {
    isOpen = !isOpen;
    window_.classList.toggle("open", isOpen);
    toggle.textContent = isOpen ? "✕" : "💬";
    if (isOpen && messages.children.length === 0) {
      addMessage("¡Hola! 👋 Soy el asistente de La Parrilla del Centro. ¿En qué te puedo ayudar?", "bot");
    }
  });

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();