(function () {
    // RUTA RELATIVA: Esto soluciona el "Error al conectar"
    const API_ENDPOINT = "/chat"; 

    // Crear un contenedor único para evitar conflictos de estilos
    const host = document.createElement('div');
    host.id = 'nodo-chatbot-container';
    document.body.appendChild(host);

    // Inyectar estilos aislados
    const style = document.createElement('style');
    style.textContent = `
        #nodo-chatbot-container { position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: sans-serif; }
        #nodo-toggle { width: 55px; height: 55px; border-radius: 50%; background: #111110; color: white; border: none; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        #nodo-window { display: none; position: absolute; bottom: 70px; right: 0; width: 320px; height: 400px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); flex-direction: column; overflow: hidden; border: 1px solid #ddd; }
        #nodo-window.open { display: flex; }
        #nodo-header { background: #111110; color: white; padding: 12px; display: flex; justify-content: space-between; align-items: center; }
        #nodo-messages { flex: 1; padding: 12px; overflow-y: auto; font-size: 14px; display: flex; flex-direction: column; gap: 8px; }
        .nodo-msg { padding: 8px 12px; border-radius: 8px; max-width: 80%; }
        .nodo-bot { background: #eee; align-self: flex-start; }
        .nodo-user { background: #111110; color: white; align-self: flex-end; }
        #nodo-input-area { padding: 10px; display: flex; gap: 5px; border-top: 1px solid #eee; }
        #nodo-input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; outline: none; }
        #nodo-send { background: #111110; color: white; border: none; padding: 0 15px; cursor: pointer; border-radius: 4px; }
    `;
    document.head.appendChild(style);

    // Crear estructura
    host.innerHTML = `
        <button id="nodo-toggle">💬</button>
        <div id="nodo-window">
            <div id="nodo-header"><span>Asistente</span><button id="nodo-close" style="background:none; border:none; color:white; cursor:pointer;">✕</button></div>
            <div id="nodo-messages"></div>
            <div id="nodo-input-area"><input id="nodo-input" placeholder="Escribí aquí..."><button id="nodo-send">➤</button></div>
        </div>
    `;

    // Lógica
    const win = document.getElementById('nodo-window');
    document.getElementById('nodo-toggle').onclick = () => win.classList.toggle('open');
    document.getElementById('nodo-close').onclick = () => win.classList.remove('open');

    const input = document.getElementById('nodo-input');
    const msgs = document.getElementById('nodo-messages');

    document.getElementById('nodo-send').onclick = async () => {
        const text = input.value;
        if (!text) return;
        msgs.innerHTML += `<div class="nodo-msg nodo-user">${text}</div>`;
        input.value = "";
        try {
            const res = await fetch(API_ENDPOINT, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({message: text}) 
            });
            const data = await res.json();
            msgs.innerHTML += `<div class="nodo-msg nodo-bot">${data.response}</div>`;
            msgs.scrollTop = msgs.scrollHeight;
        } catch(e) { 
            msgs.innerHTML += `<div class="nodo-msg nodo-bot">Error: No se pudo conectar.</div>`; 
        }
    };
})();