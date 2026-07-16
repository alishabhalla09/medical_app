import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Assessment, ImageRecord, AuditLog
from ..schemas import DiabetesInput, HeartInput, AssessmentOut
from ..auth import get_current_user
from ..ml.clinical import ClinicalPredictor
from ..ml.image import run_image_inference, UPLOADS_DIR

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

@router.post("/clinical/diabetes", response_model=AssessmentOut)
def predict_diabetes(
    inputs: DiabetesInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    predictor = ClinicalPredictor("diabetes")
    result = predictor.predict(inputs.model_dump())
    
    # Store assessment in database
    db_assessment = Assessment(
        user_id=current_user.id,
        type="clinical_diabetes",
        input_data=inputs.model_dump(),
        result=result,
        model_version=result["model_version"]
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    # Audit log
    log = AuditLog(user_id=current_user.id, action="Diabetes Risk Assessment")
    db.add(log)
    db.commit()
    
    return db_assessment

@router.post("/clinical/heart", response_model=AssessmentOut)
def predict_heart(
    inputs: HeartInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    predictor = ClinicalPredictor("heart")
    result = predictor.predict(inputs.model_dump())
    
    # Store assessment in database
    db_assessment = Assessment(
        user_id=current_user.id,
        type="clinical_heart",
        input_data=inputs.model_dump(),
        result=result,
        model_version=result["model_version"]
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    # Audit log
    log = AuditLog(user_id=current_user.id, action="Heart Disease Risk Assessment")
    db.add(log)
    db.commit()
    
    return db_assessment

@router.post("/image", response_model=AssessmentOut)
async def predict_image(
    file: UploadFile = File(...),
    source: str = Form("upload"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify file extension
    allowed_extensions = {".jpg", ".jpeg", ".png"}
    filename_orig = file.filename
    _, ext = os.path.splitext(filename_orig)
    if ext.lower() not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image type. Only JPEG and PNG are supported."
        )
        
    # Generate unique filename to avoid collision
    unique_filename = f"{uuid.uuid4().hex}{ext.lower()}"
    save_path = os.path.join(UPLOADS_DIR, unique_filename)
    
    # Save file locally
    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded image: {str(e)}"
        )
        
    # Run ML model inference & Grad-CAM
    try:
        inference_result = run_image_inference(save_path, source=source)
    except Exception as e:
        # Cleanup file if model fails
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image inference failed: {str(e)}"
        )
        
    # Create Assessment
    db_assessment = Assessment(
        user_id=current_user.id,
        type="image",
        input_data={"filename": filename_orig, "source": source},
        result={
            "finding": inference_result["finding"],
            "confidence": inference_result["confidence"],
            "recommendation": inference_result["recommendation"],
            "model_version": inference_result["model_version"]
        },
        model_version=inference_result["model_version"]
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    # Create Image Record
    db_image = ImageRecord(
        assessment_id=db_assessment.id,
        original_path=unique_filename,
        annotated_path=inference_result["annotated_filename"],
        source=source
    )
    db.add(db_image)
    db.commit()
    
    # Refresh assessment to load image relationship
    db.refresh(db_assessment)
    
    # Audit log
    log = AuditLog(user_id=current_user.id, action=f"Image Abnormality Assessment ({source})")
    db.add(log)
    db.commit()
    
    return db_assessment
