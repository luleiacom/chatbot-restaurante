import os
from pathlib import Path
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from groq import Groq
from app.config import RESTAURANT_CONFIG
from app.database import save_message, get_history

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def build_system_prompt() -> str:
    config = RESTAURANT_CONFIG

    # Hora actual Argentina (UTC-3)
    tz_argentina = timezone(timedelta(hours=-3))
    ahora = datetime.now(tz_argentina)
    hora_actual = ahora.strftime("%H:%M")
    dia_semana = ahora.strftime("%A")
    dias_es = {
        "Monday": "lunes", "Tuesday": "martes", "Wednesday": "miércoles",
        "Thursday": "jueves", "Friday": "viernes", "Saturday": "sábado", "Sunday": "domingo"
    }
    dia_actual = dias_es[dia_semana]

    menu_text = ""
    for category, items in config["menu"].items():
        menu_text += f"\n{category}:\n"
        for item in items:
            menu_text += f"  - {item['name']}: ${item['price']:,}\n"

    hours_text = ""
    for day, hours in config["hours"].items():
        hours_text += f"  - {day.capitalize()}: {hours}\n"

    return f"""Sos el asistente virtual de {config['name']}.
{config['description']}.

Tu rol es ayudar a los clientes con información sobre el restaurante, el menú, horarios, reservas y cualquier consulta general. Respondés de manera amable, breve y en español rioplatense (usando "vos").

FECHA Y HORA ACTUAL: {dia_actual} {hora_actual} (hora Argentina).
Usá esta información para indicar si el restaurante está abierto o cerrado en este momento, comparando la hora actual con los horarios. Si está cerrado, decilo amablemente e informá cuándo abre próximamente.

INFORMACIÓN DEL RESTAURANTE:
- Nombre: {config['name']}
- Dirección: {config['address']}
- Teléfono: {config['phone']}
- Reservas: {config['reservations']}
- Medios de pago: {', '.join(config['payment_methods'])}
- Info adicional: {config['extra_info']}

HORARIOS:
{hours_text}

MENÚ COMPLETO:
{menu_text}

REGLAS IMPORTANTES:
- Si te preguntan algo que no sabés, ofrecé el teléfono de contacto.
- No inventes precios ni platos que no estén en el menú.
- Mantené las respuestas cortas (máximo 3-4 líneas salvo que pidan el menú completo).
- Si el cliente quiere reservar, dales el teléfono/WhatsApp.
- Nunca salgas del rol de asistente del restaurante.
"""

def chat(session_id: str, user_message: str) -> str:
    save_message(session_id, "user", user_message)
    history = get_history(session_id)

    messages = [{"role": "system", "content": build_system_prompt()}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=500,
        )
        assistant_message = response.choices[0].message.content
        save_message(session_id, "assistant", assistant_message)
        return assistant_message

    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        return "Disculpame, estoy teniendo problemas técnicos en este momento."