import os
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from PIL import Image, ImageDraw
from .models import User, Assessment, ImageRecord, AuditLog
from .auth import hash_password

def seed_database(db: Session):
    """Seeds the SQLite database with mock clinician, admin, patient, and historical assessments."""
    # Check if database is already seeded
    if db.query(User).filter(User.email == "patient@example.com").first() is not None:
        return
        
    print("Seeding database with mock clinical logs...")
    
    # 1. Create Mock Users
    patient = User(
        name="John Doe (Patient)",
        email="patient@example.com",
        password_hash=hash_password("password123"),
        role="patient",
        created_at=datetime.utcnow() - timedelta(days=5)
    )
    
    clinician = User(
        name="Dr. Sarah Connor",
        email="clinician@example.com",
        password_hash=hash_password("password123"),
        role="clinician",
        created_at=datetime.utcnow() - timedelta(days=10)
    )
    
    admin = User(
        name="System Administrator",
        email="admin@example.com",
        password_hash=hash_password("password123"),
        role="admin",
        created_at=datetime.utcnow() - timedelta(days=15)
    )
    
    db.add_all([patient, clinician, admin])
    db.commit()
    db.refresh(patient)
    db.refresh(clinician)
    db.refresh(admin)

    # 2. Generate Static Dummy Images for visual assessments
    # We want these files to exist in static so they render in the dashboard
    MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
    STATIC_DIR = os.path.abspath(os.path.join(MODEL_DIR, "..", "static"))
    uploads_dir = os.path.join(STATIC_DIR, "uploads")
    annotated_dir = os.path.join(STATIC_DIR, "annotated")
    
    os.makedirs(uploads_dir, exist_ok=True)
    os.makedirs(annotated_dir, exist_ok=True)
    
    orig_dummy_filename = "dummy_xray.png"
    cam_dummy_filename = "cam_dummy_xray.png"
    
    orig_dummy_path = os.path.join(uploads_dir, orig_dummy_filename)
    cam_dummy_path = os.path.join(annotated_dir, cam_dummy_filename)
    
    # Draw original mock X-ray
    if not os.path.exists(orig_dummy_path):
        img = Image.new('RGB', (300, 300), color=(20, 20, 20))
        d = ImageDraw.Draw(img)
        # Draw a simulated ribcage outline
        d.ellipse([50, 40, 250, 260], outline=(100, 100, 100), width=4)
        for i in range(70, 230, 25):
            d.line([80, i, 220, i], fill=(70, 70, 70), width=3)
        d.text((20, 275), "MOCK SCAN REF: XRAY-9801", fill=(150, 150, 150))
        img.save(orig_dummy_path)
        
    # Draw Grad-CAM overlay mock
    if not os.path.exists(cam_dummy_path):
        img_cam = Image.open(orig_dummy_path).convert('RGB')
        # Create a jet radial glow on right side of the lung outline
        overlay = Image.new('RGBA', (300, 300), (0,0,0,0))
        overlay_draw = ImageDraw.Draw(overlay)
        # Red center activation spot
        overlay_draw.ellipse([80, 100, 160, 180], fill=(255, 0, 0, 100), outline=(255, 200, 0, 120), width=2)
        # Green surrounding halo
        overlay_draw.ellipse([60, 80, 180, 200], fill=(0, 255, 0, 50))
        
        # Combine
        img_cam.paste(overlay, (0,0), overlay)
        img_cam.save(cam_dummy_path)

    # 3. Create Patient Assessments
    
    # Assessment 1: Diabetes Low Risk
    diabetes_low_result = {
        "risk_score": 14.52,
        "category": "Low",
        "model_version": "Clinical-v1.0-Seeded",
        "contributions": [
            {"feature": "glucose", "value": 98.0, "impact": -0.45, "direction": "decreases risk", "normal_reference": "Mean: 120.0"},
            {"feature": "bmi", "value": 22.4, "impact": -0.65, "direction": "decreases risk", "normal_reference": "Mean: 32.0"},
            {"feature": "age", "value": 28.0, "impact": -0.22, "direction": "decreases risk", "normal_reference": "Mean: 33.0"},
            {"feature": "blood_pressure", "value": 72.0, "impact": 0.05, "direction": "neutral impact", "normal_reference": "Mean: 69.0"},
            {"feature": "insulin", "value": 80.0, "impact": 0.0, "direction": "neutral impact", "normal_reference": "Mean: 80.0"},
            {"feature": "pregnancies", "value": 1.0, "impact": -0.15, "direction": "decreases risk", "normal_reference": "Mean: 3.8"},
            {"feature": "family_history", "value": 0.15, "impact": -0.5, "direction": "decreases risk", "normal_reference": "Mean: 0.4"}
        ]
    }
    a1 = Assessment(
        user_id=patient.id,
        type="clinical_diabetes",
        input_data={"glucose": 98.0, "bmi": 22.4, "age": 28.0, "blood_pressure": 72.0, "insulin": 80.0, "pregnancies": 1.0, "family_history": 0.15},
        result=diabetes_low_result,
        model_version="Clinical-v1.0-Seeded",
        created_at=datetime.utcnow() - timedelta(days=3)
    )
    
    # Assessment 2: Heart Disease High Risk
    heart_high_result = {
        "risk_score": 84.75,
        "category": "High",
        "model_version": "Clinical-v1.0-Seeded",
        "contributions": [
            {"feature": "exercise_angina", "value": 1.0, "impact": 1.25, "direction": "increases risk", "normal_reference": "Mean: 0.3"},
            {"feature": "cholesterol", "value": 285.0, "impact": 0.85, "direction": "increases risk", "normal_reference": "Mean: 246.0"},
            {"feature": "chest_pain_type", "value": 3.0, "impact": 0.95, "direction": "increases risk", "normal_reference": "Mean: 1.0"},
            {"feature": "max_heart_rate", "value": 115.0, "impact": 0.65, "direction": "increases risk", "normal_reference": "Mean: 149.0"},
            {"feature": "age", "value": 68.0, "impact": 0.45, "direction": "increases risk", "normal_reference": "Mean: 54.0"},
            {"feature": "resting_bp", "value": 155.0, "impact": 0.55, "direction": "increases risk", "normal_reference": "Mean: 131.0"},
            {"feature": "ecg_results", "value": 1.0, "impact": 0.1, "direction": "neutral impact", "normal_reference": "Mean: 0.5"}
        ]
    }
    a2 = Assessment(
        user_id=patient.id,
        type="clinical_heart",
        input_data={"age": 68.0, "cholesterol": 285.0, "resting_bp": 155.0, "max_heart_rate": 115.0, "chest_pain_type": 3.0, "ecg_results": 1.0, "exercise_angina": 1.0},
        result=heart_high_result,
        model_version="Clinical-v1.0-Seeded",
        created_at=datetime.utcnow() - timedelta(days=2)
    )

    # Assessment 3: Thoracic Image Finding (Pneumonia)
    image_result = {
        "finding": "Pneumonia / Thoracic Pathology",
        "confidence": 82.5,
        "recommendation": "Potential thoracic inflammation or fluid detected. Please consult a pulmonologist for a chest X-ray evaluation.",
        "model_version": "Image-SimulatedCNN-v1.0"
    }
    a3 = Assessment(
        user_id=patient.id,
        type="image",
        input_data={"filename": "patient_chest_xray.png", "source": "upload"},
        result=image_result,
        model_version="Image-SimulatedCNN-v1.0",
        created_at=datetime.utcnow() - timedelta(days=1)
    )
    
    db.add_all([a1, a2, a3])
    db.commit()
    db.refresh(a3)

    # Save associated image records
    im_record = ImageRecord(
        assessment_id=a3.id,
        original_path=orig_dummy_filename,
        annotated_path=cam_dummy_filename,
        source="upload",
        created_at=datetime.utcnow() - timedelta(days=1)
    )
    db.add(im_record)

    # 4. Save audit logs
    l1 = AuditLog(user_id=patient.id, action="User Registered", timestamp=datetime.utcnow() - timedelta(days=5))
    l2 = AuditLog(user_id=patient.id, action="Diabetes Risk Assessment", timestamp=datetime.utcnow() - timedelta(days=3))
    l3 = AuditLog(user_id=patient.id, action="Heart Disease Risk Assessment", timestamp=datetime.utcnow() - timedelta(days=2))
    l4 = AuditLog(user_id=patient.id, action="Image Abnormality Assessment (upload)", timestamp=datetime.utcnow() - timedelta(days=1))
    
    db.add_all([l1, l2, l3, l4])
    db.commit()
    
    print("Database seeding completed successfully.")
