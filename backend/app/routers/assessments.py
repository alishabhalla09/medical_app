from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from ..database import get_db
from ..models import User, Assessment, ImageRecord
from ..schemas import AssessmentOut, DashboardStats
from ..auth import get_current_user, require_role
from ..reports import generate_assessment_pdf_report

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.get("", response_model=list[AssessmentOut])
def get_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Clinicians and admins can see all, patients see only their own
    if current_user.role in ["admin", "clinician"]:
        return db.query(Assessment).order_by(Assessment.created_at.desc()).all()
    else:
        return db.query(Assessment).filter(Assessment.user_id == current_user.id).order_by(Assessment.created_at.desc()).all()

@router.get("/{id}", response_model=AssessmentOut)
def get_assessment_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
        
    # Check permissions
    if current_user.role not in ["admin", "clinician"] and assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this assessment"
        )
        
    return assessment

@router.get("/{id}/report")
def get_assessment_pdf(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
        
    # Check permissions
    if current_user.role not in ["admin", "clinician"] and assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this report"
        )
        
    # Generate the reportLab PDF and get filepath
    try:
        pdf_path = generate_assessment_pdf_report(assessment, current_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report PDF: {str(e)}"
        )
        
    filename = f"Diagnostic_Report_{assessment.type}_{assessment.id}.pdf"
    
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=filename
    )

@router.get("/admin/stats", tags=["Admin"])
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "clinician"]))
):
    total_users = db.query(User).count()
    total_assessments = db.query(Assessment).count()
    
    # Calculate counts by type
    clinical_diabetes = db.query(Assessment).filter(Assessment.type == "clinical_diabetes").count()
    clinical_heart = db.query(Assessment).filter(Assessment.type == "clinical_heart").count()
    images = db.query(Assessment).filter(Assessment.type == "image").count()
    
    # High risk calculations
    high_risk_clinical = 0
    assessments_all = db.query(Assessment).all()
    for a in assessments_all:
        if a.type.startswith("clinical"):
            cat = a.result.get("category", "")
            if cat == "High":
                high_risk_clinical += 1
        elif a.type == "image":
            # Finding has melanoma or fracture
            finding = a.result.get("finding", "")
            if "Risk" in finding or "Pathology" in finding or "Fracture" in finding:
                high_risk_clinical += 1
                
    return {
        "total_users": total_users,
        "total_assessments": total_assessments,
        "diabetes_assessments": clinical_diabetes,
        "heart_assessments": clinical_heart,
        "image_assessments": images,
        "high_risk_flagged": high_risk_clinical
    }
