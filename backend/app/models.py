from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="patient", nullable=False)  # patient, clinician, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # 'clinical_diabetes', 'clinical_heart', 'image'
    input_data = Column(JSON, nullable=False)  # inputs as key-value JSON
    result = Column(JSON, nullable=False)  # results: score, category, explainability/grad-cam label
    model_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="assessments")
    images = relationship("ImageRecord", back_populates="assessment", cascade="all, delete-orphan", uselist=False)

class ImageRecord(Base):
    __tablename__ = "image_records"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    original_path = Column(String, nullable=False)
    annotated_path = Column(String, nullable=False)
    source = Column(String, nullable=False)  # 'upload' or 'webcam'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assessment = relationship("Assessment", back_populates="images")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
