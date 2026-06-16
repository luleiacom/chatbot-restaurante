(function () {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    const styles = `
        :host { all: initial; font-family: sans-serif; }
        .wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 999999; }
        #toggle { width: 50px; height: 50px; border-radius: 50%; background: #1a1a1a; color: white; border: none; cursor: pointer; transition: 0.3s; }
        #window { display: none; position: fixed; bottom: 80px; right: 20px; width: 320px; height: 400px; background: white; border: 1px solid #e5e5e5; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); flex-direction: column; overflow: hidden; }
        #window.open { display: flex; }
        header { background: #1a1a1a; color: white; padding: 12px; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
        #messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .msg { padding: 8px 12px; border-radius: 6px; font-size: 13px; max-width: 80%; }
        .bot { background: #f5f5f5; color: #333; align-self: flex-start; }
        .user { background: #1a1a1a; color: white; align-self: flex-end; }
        #input-area { padding: 10px; border-top: 1px solid #e5e5e5; display: flex; gap: 5px; }
        input { flex: 1; border: 1px solid #e5e5e5; padding: 6px; border-radius: 4px; outline: none; }
        button#send { background: #1a1a1a; color: white; border: none; padding: 0 10px; border-radius: 4px; cursor: pointer; }
    `;

    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    shadow.appendChild(styleEl);

    const container = document.createElement("div");
    container.className = "wrapper";
    container.innerHTML = `
        <button id="toggle">💬</button>
        <div id="window">
            <header>Asistente <button id="close" style="background:none; border:none; color:white; cursor:pointer;">✕</button></header>
            <div id="messages"></div>
            <div id="input-area">
                <input id="input" placeholder="Escribí tu consulta...">
                <button id="send">Enviar</button>
            </div>
        </div>
    `;
    shadow.appendChild(container);

    // Lógica básica
    const win = shadow.getElementById("window");
    const msgs = shadow.getElementById("messages");
    const input = shadow.getElementById("input");

    shadow.getElementById("toggle").onclick = () => win.classList.toggle("open");
    shadow.getElementById("close").onclick = () => win.classList.remove("open");
    
    shadow.getElementById("send").onclick = async () => {
        const text = input.value;
        if (!text) return;
        msgs.innerHTML += `<div class="msg user">${text}</div>`;
        input.value = "";
        try {
            const res = await fetch("/chat", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({message: text}) });
            const data = await res.json();
            msgs.innerHTML += `<div class="msg bot">${data.response}</div>`;
        } catch(e) { msgs.innerHTML += `<div class="msg bot">Error de conexión.</div>`; }
    };
})();