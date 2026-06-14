import sqlite3
import json
from datetime import datetime

DB_PATH = "chatbot.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            last_active TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def save_message(session_id: str, role: str, content: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    # Registrar sesión si no existe
    cursor.execute("""
        INSERT OR IGNORE INTO sessions (session_id, created_at, last_active)
        VALUES (?, ?, ?)
    """, (session_id, now, now))
    # Actualizar última actividad
    cursor.execute("""
        UPDATE sessions SET last_active = ? WHERE session_id = ?
    """, (now, session_id))
    # Guardar mensaje
    cursor.execute("""
        INSERT INTO conversations (session_id, role, content, timestamp)
        VALUES (?, ?, ?, ?)
    """, (session_id, role, content, now))
    conn.commit()
    conn.close()

def get_history(session_id: str) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT role, content FROM conversations
        WHERE session_id = ?
        ORDER BY timestamp ASC
    """, (session_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"role": row[0], "content": row[1]} for row in rows]

def get_all_sessions() -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.session_id, s.created_at, s.last_active,
               COUNT(c.id) as message_count
        FROM sessions s
        LEFT JOIN conversations c ON s.session_id = c.session_id
        GROUP BY s.session_id
        ORDER BY s.last_active DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "session_id": row[0],
            "created_at": row[1],
            "last_active": row[2],
            "message_count": row[3]
        }
        for row in rows
    ]