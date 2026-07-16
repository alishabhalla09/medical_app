import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import engine, Base
from .routers import auth, predict, assessments

# Ensure the DB tables are created
Base.metadata.create_all(bind=engine)

# Seed database with mock history logs
from .database import SessionLocal
from .seed import seed_database
db_session = SessionLocal()
try:
    seed_database(db_session)
finally:
    db_session.close()

app = FastAPI(
    title="Aegis Diagnostic Assistant API",
    description="High-fidelity preliminary health screening and diagnostic risk assessment model api.",
    version="1.0.0"
)

# CORS — allow all origins (needed for Render/Railway deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure backend static directories exist
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(MODEL_DIR, ".."))
STATIC_DIR = os.path.join(BACKEND_DIR, "static")
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "annotated"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "reports"), exist_ok=True)

# Mount backend static files (uploads, reports, heatmaps)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include API routers
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(assessments.router)

# ─────────────────────────────────────────────────────────────
# Serve React frontend from built dist/ folder
# Works both locally and on Render/Railway (single-server deploy)
# ─────────────────────────────────────────────────────────────
FRONTEND_DIST = os.path.abspath(os.path.join(BACKEND_DIR, "..", "frontend", "dist"))

if os.path.isdir(FRONTEND_DIST):
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="frontend-assets")

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    # Catch-all: serve index.html for all non-API routes (React Router support)
    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Don't intercept API routes or static files
        if full_path.startswith(("api/", "static/", "assets/", "docs", "redoc", "openapi")):
            from fastapi import HTTPException
            raise HTTPException(status_code=404)
        index = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index):
            return FileResponse(index)
        return {"status": "online", "message": "Frontend not built. Run: cd frontend && npm run build"}
else:
    @app.get("/")
    def read_root():
        return {
            "status": "online",
            "service": "Aegis Diagnostic Assistant API",
            "version": "1.0.0",
            "documentation": "/docs",
            "note": "Frontend not built. Run: cd frontend && npm run build"
        }
