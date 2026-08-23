import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.api.router import api_router
from backend.app.database import engine, Base
from backend.app.db_init import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed fixtures if not initialized
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Heart Kids Wear (心童裝) — Pre-Order E-Commerce REST API. Strictly GET (read) and POST (write/mutations).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Ensure upload directory exists for static file fallback
upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "uploads"))
os.makedirs(upload_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Configure CORS for React / Vite frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight responses for 1 hour
)

# Mount master API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Heart Kids Wear API is online",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "heart-kids-wear-backend"}
