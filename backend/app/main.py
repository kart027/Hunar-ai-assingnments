"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import agents, calls, people, webhooks

app = FastAPI(
    title="Hunar AI Platform API",
    description="Backend for AI Hiring Assistant and People Search & Reachout",
    version="1.0.0",
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:3000", "http://localhost:3001", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(agents.router, prefix="/api")
app.include_router(calls.router, prefix="/api")
app.include_router(people.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")


@app.on_event("startup")
async def on_startup():
    await init_db()


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
