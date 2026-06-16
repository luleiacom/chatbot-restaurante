(function () {
  const CHATBOT_URL = ""; 
  let sessionId = null;
  let isOpen = false;

  const styles = `
    /* Contenedor que no afecta al flujo del documento */
    .my-chatbot-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: sans-serif; }
    
    #chatbot-toggle { width: 50px; height: 50px; border-radius: 50%; background: #000; color: #fff; border: none; cursor: pointer; }
    
    /* Ventana flotante aislada */
    #chatbot-window { 
      display: none; position: absolute; bottom: 60px; right: 0; 
      width: 320px; height: 400px; background: white; 
      border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      flex-direction: column; overflow: hidden; border: 1px solid #ccc;
    }
    #chatbot-window.open { display: flex; }
    
    #chatbot-header { background: #000; color: white; padding: 10px; display: flex; justify-content: space-between; }
    #chatbot-messages { flex: 1; padding: 10px; overflow-y: auto; font-size: 14px; }
    #chatbot-input-area { padding: 10px; display: flex; border-top: 1px solid #eee; }
    #chatbot-input { flex: 1; border: 1px solid #ccc; border-radius: 4px; padding: 5px; }
  `;

  document.head.appendChild(document.createElement("style")).textContent = styles;
  
  const wrapper = document.createElement("div");
  wrapper.className = "my-chatbot-wrapper";
  wrapper.innerHTML = `
    <button id="chatbot-toggle">💬</button>
    <div id="chatbot-window">
      <div id="chatbot-header"><span>Asistente</span><button id="close-chat">✕</button></div>
      <div id="chatbot-messages"></div>
      <div id="chatbot-input-area"><input id="chatbot-input"><button id="send-btn">Enviar</button></div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // Lógica de funcionamiento
  const toggle = document.getElementById("chatbot-toggle"), win = document.getElementById("chatbot-window");
  toggle.onclick = () => win.classList.toggle("open");
  document.getElementById("close-chat").onclick = () => win.classList.remove("open");

  const sendBtn = document.getElementById("send-btn"), input = document.getElementById("chatbot-input"), msgs = document.getElementById("chatbot-messages");

  sendBtn.onclick = async () => {
    const text = input.value;
    if(!text) return;
    msgs.innerHTML += `<div><b>Tú:</b> ${text}</div>`;
    input.value = "";
    try {
      const res = await fetch(`${CHATBOT_URL}/chat`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({message: text, session_id: sessionId}) });
      const data = await res.json();
      sessionId = data.session_id;
      msgs.innerHTML += `<div><b>Bot:</b> ${data.response}</div>`;
    } catch(e) { msgs.innerHTML += `<div>Error de conexión</div>`; }
  };
})();