# 🏥 Aegis Medical Diagnostic Assistant

An AI-powered full-stack medical diagnostic web application for preliminary health risk assessment.

> ⚠️ **Disclaimer**: This tool is for educational/preliminary screening purposes only. It does **not** constitute a medical diagnosis. Always consult a qualified healthcare professional.

---

## 🌟 Features

- **🩸 Diabetes Risk Assessment** — Logistic regression ML model using glucose, BMI, insulin, age, and family history
- **❤️ Heart Disease Risk** — Cardiovascular risk scoring using cholesterol, BP, ECG, and chest pain type
- **🖼️ Medical Image Analysis** — CNN-based image classification for X-ray/CT/MRI abnormality detection with Grad-CAM heatmaps
- **📊 Risk Visualization** — Feature contribution charts and gauge meters
- **📋 Assessment History** — Full timeline of all past assessments
- **📄 PDF Reports** — Professional downloadable diagnostic reports via ReportLab
- **🔐 JWT Auth** — Secure login/register with role-based access (patient, clinician, admin)
- **🛡️ Admin Panel** — Audit logs, user management, system statistics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | FastAPI (Python) + Uvicorn |
| Database | SQLite + SQLAlchemy ORM |
| ML Models | NumPy logistic regression + PIL image simulation (scikit-learn / PyTorch optional) |
| Auth | JWT (PyJWT) + bcrypt |
| PDF | ReportLab |
| Styling | Vanilla CSS (dark theme, glassmorphism) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+

### 1. Clone the repo
```bash
git clone https://github.com/alishabhalla09/medical_app.git
cd medical_app
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 Patient | patient@example.com | password123 |
| 🩺 Clinician | clinician@example.com | password123 |
| 🛡️ Admin | admin@example.com | password123 |

---

## 📁 Project Structure

```
medical_app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── models.py        # SQLAlchemy DB models
│   │   ├── database.py      # DB connection
│   │   ├── auth.py          # JWT authentication
│   │   ├── seed.py          # Demo data seeding
│   │   ├── reports.py       # PDF report generation
│   │   ├── ml/
│   │   │   ├── clinical.py  # Diabetes & heart ML models
│   │   │   └── image.py     # CNN image classifier
│   │   └── routers/
│   │       ├── auth.py      # Auth endpoints
│   │       ├── predict.py   # ML prediction endpoints
│   │       └── assessments.py # History endpoints
│   ├── requirements.txt     # Core dependencies
│   └── requirements-ml.txt  # Optional heavy ML deps
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── api/             # API client
│   │   └── App.tsx          # Router & shell
│   ├── vite.config.ts
│   └── package.json
├── OPEN-ME.html             # Standalone no-server demo
├── START-APP.bat            # One-click Windows launcher
└── README.md
```

---

## 🧠 ML Models

### Clinical Models (Zero-dependency fallback)
- Custom logistic regression with numpy matrix operations
- Feature contribution scoring (SHAP-style)
- Works without scikit-learn installed

### Image Classification
- ResNet18 architecture (PyTorch optional)
- Grad-CAM heatmap overlays
- PIL-based fallback for demo environments

---

## 📸 Screenshots

| Dashboard | Assessment | Results |
|-----------|-----------|---------|
| Risk overview | Interactive sliders | Feature contributions |

---

## 📄 License

MIT License — for educational and research purposes only.
