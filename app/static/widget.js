(function () {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
        .wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 2147483647; font-family: 'DM Sans', sans-serif; }
        #toggle { width: 56px; height: 56px; border-radius: 50%; background: #111110; color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 24px; }
        #window { display: none; position: absolute; bottom: 70px; right: 0; width: 320px; height: 450px; background: #fafaf8; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); flex-direction: column; overflow: hidden; border: 1px solid #e8e8e4; }
        #window.open { display: flex; }
        header { background: #111110; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        #messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .msg { padding: 10px 14px; border-radius: 12px; font-size: 14px; max-width: 80%; line-height: 1.4; }
        .bot { background: white; border: 1px solid #e8e8e4; align-self: flex-start; }
        .user { background: #111110; color: white; align-self: flex-end; }
        #input-area { padding: 12px; display: flex; gap: 8px; border-top: 1px solid #e8e8e4; background: white; }
        input { flex: 1; padding: 10px; border: 1px solid #e8e8e4; border-radius: 20px; outline: none; font-size: 14px; }
        #send { background: #111110; color: white; border: none; border-radius: 20px; padding: 0 16px; cursor: pointer; font-weight: bold; }
    `;
    shadow.appendChild(style);

    const container = document.createElement('div');
    container.className = 'wrapper';
    container.innerHTML = `
        <button id="toggle">💬</button>
        <div id="window">
            <header><span>Asistente</span><button id="close" style="background:none; border:none; color:white; cursor:pointer;">✕</button></header>
            <div id="messages"><div class="msg bot">¡Hola! ¿En qué te ayudo?</div></div>
            <div id="input-area"><input id="text" placeholder="Escribí aquí..."><button id="send">➤</button></div>
        </div>
    `;
    shadow.appendChild(container);

    const win = shadow.getElementById('window');
    shadow.getElementById('toggle').onclick = () => win.classList.toggle('open');
    shadow.getElementById('close').onclick = () => win.classList.remove('open');

    const msgs = shadow.getElementById('messages');
    const input = shadow.getElementById('text');
    
    async function send() {
        const txt = input.value;
        if(!txt) return;
        input.value = "";
        msgs.innerHTML += `<div class="msg user">${txt}</div>`;
        try {
            const res = await fetch('/chat', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: txt}) });
            const data = await res.json();
            msgs.innerHTML += `<div class="msg bot">${data.response}</div>`;
            msgs.scrollTop = msgs.scrollHeight;
        } catch(e) { msgs.innerHTML += `<div class="msg bot">Error de conexión.</div>`; }
    }
    shadow.getElementById('send').onclick = send;
    input.onkeypress = (e) => { if(e.key === 'Enter') send(); };
})();