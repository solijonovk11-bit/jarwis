import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import init_db
from .api.chat import router as chat_router
from .api.system import router as system_router

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dastur ishga tushganda ma'lumotlar bazasini yaratish
    await init_db()
    yield

app = FastAPI(
    title="JARVIS AI Backend",
    version="2.0.0",
    description="JARVIS shaxsiy yordamchisi uchun FastAPI serveri",
    lifespan=lifespan
)

# CORS sozlamalari
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(system_router)

@app.get("/")
def root():
    return {
        "system": "JARVIS AI Mark VII Core",
        "status": "Online",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
