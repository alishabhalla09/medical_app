import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# Target directories
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.abspath(os.path.join(MODEL_DIR, "..", "..", "static"))
REPORTS_DIR = os.path.join(STATIC_DIR, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_assessment_pdf_report(assessment, user) -> str:
    """
    Generates a professional PDF report for a clinical or image assessment.
    Returns:
        Absolute filepath to the generated PDF
    """
    pdf_filename = f"report_{assessment.id}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
    
    # Document Setup
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1A365D")
    )
    
    section_title = ParagraphStyle(
        'SecTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#2B6CB0"),
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#2D3748")
    )
    
    bold_body_style = ParagraphStyle(
        'DocBoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#9B2C2C")
    )
    
    story = []
    
    # Header Banner
    story.append(Paragraph("Aegis Diagnostic Assistant", title_style))
    story.append(Paragraph("PRELIMINARY RISK SCREENING REPORT", ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#718096"),
        spaceAfter=15
    )))
    
    # Divider line
    story.append(Table([[""]], colWidths=[7.2*inch], rowHeights=[2], style=TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#2B6CB0")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0)
    ])))
    story.append(Spacer(1, 15))
    
    # Patient & Report Meta Information Table
    info_data = [
        [Paragraph("<b>Patient Name:</b>", body_style), Paragraph(user.name, body_style), 
         Paragraph("<b>Date Generated:</b>", body_style), Paragraph(assessment.created_at.strftime("%Y-%m-%d %H:%M UTC"), body_style)],
        [Paragraph("<b>Patient Email:</b>", body_style), Paragraph(user.email, body_style), 
         Paragraph("<b>Assessment ID:</b>", body_style), Paragraph(f"REF-{assessment.id:04d}", body_style)],
        [Paragraph("<b>Assessment Type:</b>", body_style), Paragraph(assessment.type.replace('_', ' ').title(), body_style), 
         Paragraph("<b>Model Version:</b>", body_style), Paragraph(assessment.model_version, body_style)]
    ]
    info_table = Table(info_data, colWidths=[1.5*inch, 2.1*inch, 1.5*inch, 2.1*inch])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 15))
    
    # Disclaimer Box
    disclaimer_text = (
        "WARNING: This document contains a preliminary screening assessment produced by an artificial "
        "intelligence algorithm. It is NOT a certified medical diagnosis, prognosis, or clinical guidance. "
        "This tool is intended strictly for educational and portfolio demonstration purposes. Under no "
        "circumstances should this report replace consultation with a qualified, licensed healthcare professional. "
        "Do not make medical decisions, adjust medication, or ignore clinical advice based on this document."
    )
    disclaimer_box = Table(
        [[Paragraph(f"<b>LEGAL DISCLAIMER:</b><br/>{disclaimer_text}", disclaimer_style)]],
        colWidths=[7.2*inch]
    )
    disclaimer_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFF5F5")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#E53E3E")),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(disclaimer_box)
    story.append(Spacer(1, 15))
    
    # Results Section
    story.append(Paragraph("Assessment Findings", section_title))
    
    if assessment.type.startswith("clinical"):
        score = assessment.result.get("risk_score", 0.0)
        category = assessment.result.get("category", "Low")
        
        # Color depending on category
        cat_colors = {
            "Low": "#38A169",
            "Medium": "#DD6B20",
            "High": "#E53E3E"
        }
        cat_color = cat_colors.get(category, "#2D3748")
        
        findings_data = [
            [Paragraph("<b>Screening Target:</b>", body_style), Paragraph("Diabetes Risk" if assessment.type == "clinical_diabetes" else "Heart Disease Risk", bold_body_style)],
            [Paragraph("<b>Calculated Risk Score:</b>", body_style), Paragraph(f"{score}%", ParagraphStyle('Score', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor(cat_color)))],
            [Paragraph("<b>Risk Category:</b>", body_style), Paragraph(category, ParagraphStyle('Cat', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor(cat_color)))],
        ]
    else:
        finding = assessment.result.get("finding", "Unknown")
        confidence = assessment.result.get("confidence", 0.0)
        recommendation = assessment.result.get("recommendation", "")
        
        findings_data = [
            [Paragraph("<b>Image Evaluation:</b>", body_style), Paragraph(finding, bold_body_style)],
            [Paragraph("<b>Model Confidence:</b>", body_style), Paragraph(f"{confidence}%", bold_body_style)],
            [Paragraph("<b>General Recommendation:</b>", body_style), Paragraph(recommendation, body_style)]
        ]
        
    findings_table = Table(findings_data, colWidths=[2.2*inch, 5.0*inch])
    findings_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F7FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(findings_table)
    story.append(Spacer(1, 20))
    
    # Feature / Data Explanation Section
    story.append(Paragraph("Input & Feature Attribution Details", section_title))
    
    if assessment.type.startswith("clinical"):
        contributions = assessment.result.get("contributions", [])
        
        # Build Table Headers
        table_rows = [[
            Paragraph("<b>Clinical Metric</b>", bold_body_style),
            Paragraph("<b>Patient Value</b>", bold_body_style),
            Paragraph("<b>Risk Attribution</b>", bold_body_style),
            Paragraph("<b>Reference</b>", bold_body_style)
        ]]
        
        for item in contributions:
            # Format display value
            metric_name = item["feature"].replace("_", " ").title()
            val_display = f"{item['value']:.2f}"
            
            # Format impact column
            impact_val = item["impact"]
            if impact_val > 0.05:
                attrib = f"Increases Risk (+{impact_val:.2f})"
                attrib_style = ParagraphStyle('Inc', parent=body_style, textColor=colors.HexColor("#C53030"))
            elif impact_val < -0.05:
                attrib = f"Decreases Risk ({impact_val:.2f})"
                attrib_style = ParagraphStyle('Dec', parent=body_style, textColor=colors.HexColor("#22543D"))
            else:
                attrib = "Neutral / Baseline"
                attrib_style = ParagraphStyle('Neu', parent=body_style, textColor=colors.HexColor("#4A5568"))
                
            table_rows.append([
                Paragraph(metric_name, body_style),
                Paragraph(val_display, body_style),
                Paragraph(attrib, attrib_style),
                Paragraph(item["normal_reference"], body_style)
            ])
            
        attrib_table = Table(table_rows, colWidths=[2.0*inch, 1.2*inch, 2.2*inch, 1.8*inch])
        attrib_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EDF2F7")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(attrib_table)
    else:
        # For image assessments, describe Grad-CAM details
        cam_text = (
            "The visual diagnostic model maps structural regions using a Grad-CAM (Gradient-Weighted "
            "Class Activation Mapping) saliency filter. The model identifies diagnostic findings by focusing on "
            "highlighted spatial fields (rendered as a heatmap layer overlay). Heatmaps indicate local "
            "pathological signals (e.g., cloudy consolidation patterns in chest X-rays for pneumonia, "
            "or irregular border pigmentations in dermoscopy images)."
        )
        story.append(Paragraph(cam_text, body_style))
        story.append(Spacer(1, 10))
        story.append(Paragraph("The visual Grad-CAM output can be reviewed in the historical log of the user portal.", bold_body_style))
        
    doc.build(story)
    return pdf_path
