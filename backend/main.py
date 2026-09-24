import os
import sys
from pathlib import Path

# Ensure backend directory and project root are in sys.path for Render deployment
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.routes.cascade import router as cascade_router
    from backend.routes.incidents import router as incidents_router
    from backend.routes.graph import router as graph_router
except ImportError:
    from routes.cascade import router as cascade_router
    from routes.incidents import router as incidents_router
    from routes.graph import router as graph_router

app = FastAPI(title="CascadeGuard Backend")

# CORS Middleware Configuration for Frontend Integration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://cascade-guard-ai.vercel.app",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if os.getenv("FRONTEND_URL") else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(cascade_router, prefix="/api")
app.include_router(incidents_router, prefix="/api")
app.include_router(graph_router, prefix="/api")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CascadeGuard Backend"
    }