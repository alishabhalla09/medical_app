from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

# User schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "patient"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Clinical inputs validation
class DiabetesInput(BaseModel):
    glucose: float = Field(..., ge=0.0, le=500.0)
    bmi: float = Field(..., ge=0.0, le=100.0)
    age: float = Field(..., ge=0.0, le=120.0)
    blood_pressure: float = Field(..., ge=0.0, le=300.0)
    insulin: float = Field(..., ge=0.0, le=1000.0)
    pregnancies: float = Field(..., ge=0.0, le=30.0)
    family_history: float = Field(..., ge=0.0, le=1.0) # probability index between 0 and 1

class HeartInput(BaseModel):
    age: float = Field(..., ge=0.0, le=120.0)
    cholesterol: float = Field(..., ge=0.0, le=1000.0)
    resting_bp: float = Field(..., ge=0.0, le=300.0)
    max_heart_rate: float = Field(..., ge=0.0, le=300.0)
    chest_pain_type: float = Field(..., ge=0.0, le=3.0)  # 0, 1, 2, 3
    ecg_results: float = Field(..., ge=0.0, le=2.0)      # 0, 1, 2
    exercise_angina: float = Field(..., ge=0.0, le=1.0)  # 0 or 1

# Assessment outputs
class ImageRecordOut(BaseModel):
    id: int
    original_path: str
    annotated_path: str
    source: str

    class Config:
        from_attributes = True

class AssessmentOut(BaseModel):
    id: int
    user_id: int
    type: str
    input_data: Dict[str, Any]
    result: Dict[str, Any]
    model_version: str
    created_at: datetime
    images: Optional[ImageRecordOut] = None

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_assessments: int
    high_risk_count: int
    clinical_count: int
    image_count: int
    recent_assessments: List[AssessmentOut]
