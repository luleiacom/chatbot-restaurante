import uuid
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from app.chat import chat
from app.database import init_db, get_all_sessions, get_history

app = FastAPI(title="Chatbot Restaurante")

# CORS para que el widget funcione desde cualquier dominio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Archivos estáticos
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Inicializar base de datos al arrancar
@app.on_event("startup")
async def startup():
    init_db()

# Modelos
class MessageRequest(BaseModel):
    session_id: str | None = None
    message: str

class MessageResponse(BaseModel):
    session_id: str
    response: str

# ── Rutas ──────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def root():
    with open("app/static/demo.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/chat", response_model=MessageResponse)
async def chat_endpoint(request: MessageRequest):
    # Si no viene session_id, crear uno nuevo
    session_id = request.session_id or str(uuid.uuid4())
    
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")
    
    response = chat(session_id, request.message)
    
    return MessageResponse(session_id=session_id, response=response)

@app.get("/admin/sessions")
async def admin_sessions():
    return get_all_sessions()

@app.get("/admin/sessions/{session_id}")
async def admin_session_detail(session_id: str):
    history = get_history(session_id)
    if not history:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return {"session_id": session_id, "messages": history}

@app.get("/admin", response_class=HTMLResponse)
async def admin_panel():
    with open("app/static/admin.html", "r", encoding="utf-8") as f:
        return f.read()