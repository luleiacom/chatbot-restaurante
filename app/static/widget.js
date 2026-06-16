(function () {
    // 1. Crear contenedor principal que no afectará tu CSS
    const wrapper = document.createElement('div');
    wrapper.id = 'chatbot-wrapper-nodos';
    document.body.appendChild(wrapper);

    // 2. Estilos aislados en una variable (usando !important solo para protegerse)
    const style = document.createElement('style');
    style.innerHTML = `
        #chatbot-wrapper-nodos { 
            position: fixed; bottom: 20px; right: 20px; z-index: 999999; 
            font-family: 'DM Sans', sans-serif !important; 
        }
        #chatbot-btn { 
            width: 55px; height: 55px; border-radius: 50%; background: #111110; 
            color: white; border: none; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            font-size: 24px; transition: transform 0.2s;
        }
        #chatbot-window { 
            display: none; position: absolute; bottom: 70px; right: 0; width: 350px; 
            height: 500px; background: white; border-radius: 20px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.15); overflow: hidden;
            flex-direction: column; border: 1px solid #e8e8e4;
        }
        #chatbot-window.open { display: flex; }
        #chatbot-header { background: #111110; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        #chat-messages { flex: 1; padding: 15px; overflow-y: auto; background: #fafaf8; display: flex; flex-direction: column; gap: 10px; }
        .chat-msg { padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 80%; }
        .bot { background: white; border: 1px solid #e8e8e4; align-self: flex-start; }
        .user { background: #111110; color: white; align-self: flex-end; }
        #chat-input-area { padding: 10px; display: flex; gap: 5px; border-top: 1px solid #e8e8e4; }
        #chat-input { flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 8px 15px; outline: none; }
        #send-btn { background: #111110; color: white; border: none; border-radius: 20px; padding: 0 15px; cursor: pointer; }
    `;
    document.head.appendChild(style);

    // 3. Crear el HTML del chat
    wrapper.innerHTML = `
        <button id="chatbot-btn">💬</button>
        <div id="chatbot-window">
            <div id="chatbot-header"><span>Asistente</span><button id="close-btn" style="background:none; border:none; color:white; cursor:pointer;">✕</button></div>
            <div id="chat-messages"><div class="chat-msg bot">¡Hola! ¿En qué te ayudo?</div></div>
            <div id="chat-input-area">
                <input id="chat-input" placeholder="Escribí tu consulta...">
                <button id="send-btn">➤</button>
            </div>
        </div>
    `;

    // 4. Lógica simple de eventos
    const btn = document.getElementById('chatbot-btn');
    const win = document.getElementById('chatbot-window');
    btn.onclick = () => win.classList.toggle('open');
    document.getElementById('close-btn').onclick = () => win.classList.remove('open');

    // 5. Conexión (Ruta relativa)
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chat-input');
    const msgs = document.getElementById('chat-messages');

    sendBtn.onclick = async () => {
        const text = input.value;
        if (!text) return;
        input.value = '';
        msgs.innerHTML += `<div class="chat-msg user">${text}</div>`;
        try {
            const res = await fetch('/chat', { // Ruta relativa
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            msgs.innerHTML += `<div class="chat-msg bot">${data.response}</div>`;
            msgs.scrollTop = msgs.scrollHeight;
        } catch(e) { msgs.innerHTML += `<div class="chat-msg bot">Error de conexión.</div>`; }
    };
})();