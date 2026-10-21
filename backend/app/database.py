import aiosqlite
import os
from typing import List, Dict, Any
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "jarvis_history.db")
_initialized = False

async def init_db():
    """Ma'lumotlar bazasini initsializatsiya qilish."""
    global _initialized
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        await db.commit()
    _initialized = True

async def _ensure_db():
    if not _initialized:
        await init_db()

async def save_message(session_id: str, role: str, content: str) -> None:
    """Yangi xabarni saqlash."""
    await _ensure_db()
    ts = datetime.utcnow().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO messages (session_id, role, content, timestamp) VALUES (?, ?, ?, ?)",
            (session_id, role, content, ts)
        )
        await db.commit()

async def get_history(session_id: str = "default", limit: int = 50) -> List[Dict[str, Any]]:
    """Sessiya tarixini olish."""
    await _ensure_db()
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT role, content, timestamp FROM messages WHERE session_id = ? ORDER BY id ASC LIMIT ?",
            (session_id, limit)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

async def clear_history(session_id: str = "default") -> None:
    """Sessiya tarixini tozalash."""
    await _ensure_db()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
        await db.commit()
