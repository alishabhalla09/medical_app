import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# CORS setup
# Allow requests from standard frontend development ports (Vite default is 5173, Next is 3000)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist and mount static files router
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.abspath(os.path.join(MODEL_DIR, "..", "static"))
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "annotated"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "reports"), exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(assessments.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Aegis Diagnostic Assistant API",
        "version": "1.0.0",
        "documentation": "/docs"
    }
