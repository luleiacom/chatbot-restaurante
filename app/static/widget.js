(function () {
    // RUTA RELATIVA: esto evita errores de conexión en Railway
    const API_ENDPOINT = "/chat"; 

    // Creamos el contenedor y el Shadow DOM
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    const styles = `
        :host { all: initial; font-family: sans-serif; }
        .wrapper { position: fixed; bottom: 28px; right: 28px; z-index: 999999; }
        #chatbot-toggle { width: 56px; height: 56px; border-radius: 50%; background: #111110; color: white; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        #chatbot-window { display: none; position: fixed; bottom: 100px; right: 28px; width: 350px; height: 500px; background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); flex-direction: column; overflow: hidden; border: 1px solid #ddd; }
        #chatbot-window.open { display: flex; }
        #chatbot-header { background: #111110; color: white; padding: 15px; display: flex; justify-content: space-between; }
        #chatbot-messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #fafafa; }
        .msg { padding: 10px; border-radius: 10px; max-width: 80%; font-size: 14px; }
        .bot { background: #eee; align-self: flex-start; }
        .user { background: #111110; color: white; align-self: flex-end; }
        #chatbot-input-area { padding: 10px; border-top: 1px solid #ddd; display: flex; gap: 5px; }
        input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { cursor: pointer; }
    `;

    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    shadow.appendChild(styleEl);

    const container = document.createElement("div");
    container.className = "wrapper";
    container.innerHTML = `
        <button id="chatbot-toggle">💬</button>
        <div id="chatbot-window">
            <div id="chatbot-header"><span>Asistente</span><button id="chatbot-close">✕</button></div>
            <div id="chatbot-messages"></div>
            <div id="chatbot-input-area">
                <input id="chatbot-input" placeholder="Escribí aquí...">
                <button id="chatbot-send">➤</button>
            </div>
        </div>
    `;
    shadow.appendChild(container);

    // Lógica
    const win = shadow.getElementById("chatbot-window");
    const msgs = shadow.getElementById("chatbot-messages");
    const input = shadow.getElementById("chatbot-input");

    shadow.getElementById("chatbot-toggle").onclick = () => win.classList.toggle("open");
    shadow.getElementById("chatbot-close").onclick = () => win.classList.remove("open");

    shadow.getElementById("chatbot-send").onclick = async () => {
        const text = input.value;
        if (!text) return;
        msgs.innerHTML += `<div class="msg user">${text}</div>`;
        input.value = "";
        try {
            const res = await fetch(API_ENDPOINT, { 
                method: "POST", 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({message: text}) 
            });
            const data = await res.json();
            msgs.innerHTML += `<div class="msg bot">${data.response}</div>`;
        } catch(e) {
            msgs.innerHTML += `<div class="msg bot">Error al conectar.</div>`;
        }
    };
})();