import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Include app directory in search path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database import Base, get_db

# Use test SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_medical_assistant.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override database session dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_medical_assistant.db"):
        os.remove("./test_medical_assistant.db")

client = TestClient(app)

def test_auth_register_login():
    # Register test
    register_response = client.post(
        "/api/auth/register",
        json={
            "name": "Test Doctor",
            "email": "testdoc@example.com",
            "password": "securepassword123",
            "role": "patient"
        }
    )
    assert register_response.status_code == 201
    data = register_response.json()
    assert data["email"] == "testdoc@example.com"
    assert data["name"] == "Test Doctor"
    
    # Login test
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "testdoc@example.com",
            "password": "securepassword123"
        }
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == "testdoc@example.com"

def test_clinical_risk_predictions():
    # Register first and get access token
    client.post(
        "/api/auth/register",
        json={
            "name": "Alex Patient",
            "email": "alex@example.com",
            "password": "securepassword123",
            "role": "patient"
        }
    )
    
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "alex@example.com",
            "password": "securepassword123"
        }
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test Diabetes prediction
    diabetes_response = client.post(
        "/api/predict/clinical/diabetes",
        headers=headers,
        json={
            "glucose": 130.0,
            "bmi": 29.5,
            "age": 40.0,
            "blood_pressure": 82.0,
            "insulin": 90.0,
            "pregnancies": 1.0,
            "family_history": 0.3
        }
    )
    assert diabetes_response.status_code == 200
    diabetes_data = diabetes_response.json()
    assert diabetes_data["type"] == "clinical_diabetes"
    assert "risk_score" in diabetes_data["result"]
    assert "category" in diabetes_data["result"]
    
    # Test Heart Disease prediction
    heart_response = client.post(
        "/api/predict/clinical/heart",
        headers=headers,
        json={
            "age": 52.0,
            "cholesterol": 240.0,
            "resting_bp": 135.0,
            "max_heart_rate": 145.0,
            "chest_pain_type": 1.0,
            "ecg_results": 0.0,
            "exercise_angina": 0.0
        }
    )
    assert heart_response.status_code == 200
    heart_data = heart_response.json()
    assert heart_data["type"] == "clinical_heart"
    assert "risk_score" in heart_data["result"]
    assert "category" in heart_data["result"]
