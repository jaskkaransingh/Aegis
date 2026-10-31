"""
AEGIS - Autonomous Evidence-Grounded Investigation System.
Main FastAPI Application Entrypoint.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from app.api.routes import router

# Load environment configuration if available
load_dotenv()

CORS_ORIGINS = [
    "*",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Allow custom CORS origin override from environment
env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    try:
        import json
        parsed = json.loads(env_origins)
        if isinstance(parsed, list):
            CORS_ORIGINS.extend(parsed)
    except Exception:
        CORS_ORIGINS.extend([o.strip() for o in env_origins.split(",") if o.strip()])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: performs startup validation and shutdown cleanup."""
    # Startup: ensure deterministic data files exist
    from app.tools.data_loader import load_clock_metadata, load_raw_logs, load_services_catalog
    try:
        load_raw_logs()
        load_clock_metadata()
        load_services_catalog()
    except Exception as e:
        print(f"[AEGIS STARTUP WARNING] Data file verification encountered: {e}")
    yield
    # Shutdown hook
    pass


app = FastAPI(
    title="AEGIS - Autonomous Evidence-Grounded Investigation System",
    description=(
        "Cross-service failure investigation engine for critical public infrastructure. "
        "Provides deterministic evidence normalization, clock offset correction, and dependency topology."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensures consistent, structured error responses across all unhandled exceptions."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": str(exc),
            "path": request.url.path,
        },
    )

# Include API Router
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
