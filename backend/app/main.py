import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from .database import init_db
from .api.chat import router as chat_router
from .api.system import router as system_router
from .api.agent import router as agent_router

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="JARVIS AI All-in-One Core",
    version="2.0.0",
    description="JARVIS shaxsiy yordamchisi: bitta manzilda Web UI, AI va Windows boshqaruvi",
    lifespan=lifespan
)

# CORS sozlamalari
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(chat_router)
app.include_router(system_router)
app.include_router(agent_router)

# Mount Frontend Dist directory (bitta manzilda UI ni ko'rsatish)
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "system": "JARVIS AI Mark VII Unified Core",
            "status": "Online",
            "message": "Frontend hali dist qilinmagan. 'npm run build' bajaring yoki http://localhost:5173 ga kiring.",
            "documentation": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
