# 🤖 Chatbot con IA para Restaurantes

Widget de chat embebible con inteligencia artificial, pensado para negocios gastronómicos. Se integra en cualquier sitio web con una sola línea de código.

**[→ Ver demo en vivo](#)** ← (acá vas a poner la URL cuando deployemos)

---

## ✨ Funcionalidades

- Respuestas naturales con IA (Groq + LLaMA 3.3)
- Memoria de conversación por sesión
- Saludo personalizado según horario
- Botones de respuesta rápida
- Panel admin para ver todas las conversaciones
- Responsive — funciona en mobile y desktop
- Embebible en cualquier web con un `<script>` tag

## 🛠️ Stack

- **Backend:** Python · FastAPI · SQLite
- **IA:** Groq API (LLaMA 3.3 70B)
- **Frontend:** HTML · CSS · JavaScript vanilla

## 🚀 Instalación local

```bash
# Clonar el repo
git clone https://github.com/luleiacom/chatbot-restaurante.git
cd chatbot-restaurante

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu GROQ_API_KEY

# Correr el servidor
uvicorn app.main:app --reload
```

Abrí `http://localhost:8000` para ver la demo.

## ⚙️ Configuración

Editá `app/config.py` para personalizar el chatbot para cualquier restaurante:

```python
RESTAURANT_CONFIG = {
    "name": "Nombre del restaurante",
    "hours": { ... },
    "menu": { ... },
}
```

## 📦 Integración en cualquier web

```html
<script src="https://tu-dominio.com/static/widget.js"></script>
```

## 📊 Panel Admin

Accedé a `/admin` para ver todas las conversaciones en tiempo real.

---

Desarrollado por [Lucía Iacono](https://github.com/luleiacom) · [NODO Automatización e IA](#)