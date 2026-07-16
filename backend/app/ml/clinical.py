import os
import pickle
import numpy as np

try:
    from sklearn.linear_model import LogisticRegression
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# Paths for saved models
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
DIABETES_MODEL_PATH = os.path.join(MODEL_DIR, "diabetes_model.pkl")
HEART_MODEL_PATH = os.path.join(MODEL_DIR, "heart_model.pkl")

# Standard clinical means and standard deviations for training and scaling
DIABETES_FEATURES = ["glucose", "bmi", "age", "blood_pressure", "insulin", "pregnancies", "family_history"]
DIABETES_MEANS = {
    "glucose": 120.0,
    "bmi": 32.0,
    "age": 33.0,
    "blood_pressure": 69.0,
    "insulin": 80.0,
    "pregnancies": 3.8,
    "family_history": 0.4
}
DIABETES_STDS = {
    "glucose": 30.0,
    "bmi": 7.0,
    "age": 11.0,
    "blood_pressure": 12.0,
    "insulin": 115.0,
    "pregnancies": 3.3,
    "family_history": 0.3
}

# Fallback coefficients for diabetes (logistic weights)
DIABETES_FALLBACK_COEFS = [1.65, 1.15, 0.45, 0.25, 0.12, 0.35, 0.95]
DIABETES_FALLBACK_INTERCEPT = -1.25

HEART_FEATURES = ["age", "cholesterol", "resting_bp", "max_heart_rate", "chest_pain_type", "ecg_results", "exercise_angina"]
HEART_MEANS = {
    "age": 54.0,
    "cholesterol": 246.0,
    "resting_bp": 131.0,
    "max_heart_rate": 149.0,
    "chest_pain_type": 1.0,
    "ecg_results": 0.5,
    "exercise_angina": 0.3
}
HEART_STDS = {
    "age": 9.0,
    "cholesterol": 51.0,
    "resting_bp": 17.0,
    "max_heart_rate": 22.0,
    "chest_pain_type": 1.0,
    "ecg_results": 0.5,
    "exercise_angina": 0.4
}

# Fallback coefficients for heart disease (logistic weights)
HEART_FALLBACK_COEFS = [0.38, 0.45, 0.28, -0.62, 0.85, 0.18, 1.12]
HEART_FALLBACK_INTERCEPT = -0.95

def train_and_save_diabetes_model():
    """Generates synthetic diabetes dataset and trains a model."""
    if not SKLEARN_AVAILABLE:
        return
    try:
        np.random.seed(42)
        n_samples = 1000
        
        glucose = np.random.normal(DIABETES_MEANS["glucose"], DIABETES_STDS["glucose"], n_samples)
        bmi = np.random.normal(DIABETES_MEANS["bmi"], DIABETES_STDS["bmi"], n_samples)
        age = np.random.normal(DIABETES_MEANS["age"], DIABETES_STDS["age"], n_samples)
        bp = np.random.normal(DIABETES_MEANS["blood_pressure"], DIABETES_STDS["blood_pressure"], n_samples)
        insulin = np.random.normal(DIABETES_MEANS["insulin"], DIABETES_STDS["insulin"], n_samples)
        pregnancies = np.random.poisson(DIABETES_MEANS["pregnancies"], n_samples).astype(float)
        family_history = np.random.uniform(0, 1.0, n_samples)
        
        glucose = np.clip(glucose, 40, 250)
        bmi = np.clip(bmi, 15, 60)
        age = np.clip(age, 18, 90)
        bp = np.clip(bp, 40, 150)
        insulin = np.clip(insulin, 10, 800)
        
        logit = (
            0.05 * (glucose - 100) + 
            0.12 * (bmi - 25) + 
            0.03 * (age - 30) + 
            0.01 * (bp - 80) + 
            0.002 * (insulin - 50) + 
            0.2 * pregnancies + 
            1.5 * family_history - 
            4.0
        )
        
        prob = 1 / (1 + np.exp(-logit))
        y = (np.random.uniform(0, 1, n_samples) < prob).astype(int)
        
        X = np.column_stack([glucose, bmi, age, bp, insulin, pregnancies, family_history])
        
        means = np.array([DIABETES_MEANS[f] for f in DIABETES_FEATURES])
        stds = np.array([DIABETES_STDS[f] for f in DIABETES_FEATURES])
        X_scaled = (X - means) / stds
        
        model = LogisticRegression()
        model.fit(X_scaled, y)
        
        payload = {
            "model": model,
            "features": DIABETES_FEATURES,
            "means": DIABETES_MEANS,
            "stds": DIABETES_STDS
        }
        
        with open(DIABETES_MODEL_PATH, "wb") as f:
            pickle.dump(payload, f)
    except Exception as e:
        print(f"Skipping diabetes training due to: {e}")

def train_and_save_heart_model():
    """Generates synthetic heart disease dataset and trains a model."""
    if not SKLEARN_AVAILABLE:
        return
    try:
        np.random.seed(42)
        n_samples = 1000
        
        age = np.random.normal(HEART_MEANS["age"], HEART_STDS["age"], n_samples)
        chol = np.random.normal(HEART_MEANS["cholesterol"], HEART_STDS["cholesterol"], n_samples)
        resting_bp = np.random.normal(HEART_MEANS["resting_bp"], HEART_STDS["resting_bp"], n_samples)
        max_hr = np.random.normal(HEART_MEANS["max_heart_rate"], HEART_STDS["max_heart_rate"], n_samples)
        cp = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.5, 0.2, 0.2, 0.1]).astype(float)
        ecg = np.random.choice([0, 1, 2], size=n_samples, p=[0.5, 0.45, 0.05]).astype(float)
        exang = np.random.choice([0.0, 1.0], size=n_samples, p=[0.7, 0.3])
        
        chol = np.clip(chol, 100, 500)
        resting_bp = np.clip(resting_bp, 80, 200)
        max_hr = np.clip(max_hr, 60, 220)
        
        logit = (
            0.04 * (age - 45) +
            0.008 * (chol - 200) +
            0.02 * (resting_bp - 120) -
            0.03 * (max_hr - 150) +
            0.8 * cp +
            0.5 * ecg +
            1.2 * exang -
            2.5
        )
        
        prob = 1 / (1 + np.exp(-logit))
        y = (np.random.uniform(0, 1, n_samples) < prob).astype(int)
        
        X = np.column_stack([age, chol, resting_bp, max_hr, cp, ecg, exang])
        
        means = np.array([HEART_MEANS[f] for f in HEART_FEATURES])
        stds = np.array([HEART_STDS[f] for f in HEART_FEATURES])
        X_scaled = (X - means) / stds
        
        model = LogisticRegression()
        model.fit(X_scaled, y)
        
        payload = {
            "model": model,
            "features": HEART_FEATURES,
            "means": HEART_MEANS,
            "stds": HEART_STDS
        }
        
        with open(HEART_MODEL_PATH, "wb") as f:
            pickle.dump(payload, f)
    except Exception as e:
        print(f"Skipping heart training due to: {e}")

# Auto-train models if sklearn is available
if SKLEARN_AVAILABLE:
    if not os.path.exists(DIABETES_MODEL_PATH):
        train_and_save_diabetes_model()
    if not os.path.exists(HEART_MODEL_PATH):
        train_and_save_heart_model()

class ClinicalPredictor:
    def __init__(self, model_type: str):
        self.model_type = model_type
        self.use_fallback = not SKLEARN_AVAILABLE or not os.path.exists(
            DIABETES_MODEL_PATH if model_type == "diabetes" else HEART_MODEL_PATH
        )
        
        if not self.use_fallback:
            try:
                self.model_path = DIABETES_MODEL_PATH if model_type == "diabetes" else HEART_MODEL_PATH
                with open(self.model_path, "rb") as f:
                    self.data = pickle.load(f)
                self.model = self.data["model"]
                self.features = self.data["features"]
                self.means = self.data["means"]
                self.stds = self.data["stds"]
            except Exception:
                self.use_fallback = True

        if self.use_fallback:
            if model_type == "diabetes":
                self.features = DIABETES_FEATURES
                self.means = DIABETES_MEANS
                self.stds = DIABETES_STDS
                self.coefs = DIABETES_FALLBACK_COEFS
                self.intercept = DIABETES_FALLBACK_INTERCEPT
            else:
                self.features = HEART_FEATURES
                self.means = HEART_MEANS
                self.stds = HEART_STDS
                self.coefs = HEART_FALLBACK_COEFS
                self.intercept = HEART_FALLBACK_INTERCEPT

    def predict(self, inputs: dict) -> dict:
        x_scaled = []
        for idx, feat in enumerate(self.features):
            val = float(inputs.get(feat, self.means[feat]))
            scaled = (val - self.means[feat]) / self.stds[feat]
            x_scaled.append(scaled)
            
        x_scaled = np.array(x_scaled)
        
        if not self.use_fallback:
            prob = self.model.predict_proba(x_scaled.reshape(1, -1))[0, 1]
            coefficients = self.model.coef_[0]
        else:
            logit = np.sum(x_scaled * np.array(self.coefs)) + self.intercept
            prob = 1 / (1 + np.exp(-logit))
            coefficients = self.coefs
            
        risk_score = round(float(prob) * 100, 2)
        
        if risk_score < 30:
            category = "Low"
        elif risk_score < 70:
            category = "Medium"
        else:
            category = "High"
            
        contributions = []
        for idx, feat in enumerate(self.features):
            val = float(inputs.get(feat, self.means[feat]))
            scaled_val = (val - self.means[feat]) / self.stds[feat]
            impact = float(coefficients[idx] * scaled_val)
            
            if impact > 0.1:
                direction = "increases risk"
            elif impact < -0.1:
                direction = "decreases risk"
            else:
                direction = "neutral impact"
                
            contributions.append({
                "feature": feat,
                "value": val,
                "impact": round(impact, 4),
                "direction": direction,
                "normal_reference": f"Mean: {self.means[feat]:.1f}"
            })
            
        contributions.sort(key=lambda item: abs(item["impact"]), reverse=True)
            
        return {
            "risk_score": risk_score,
            "category": category,
            "contributions": contributions,
            "model_version": "Clinical-v1.0-Fallback" if self.use_fallback else "Clinical-v1.0"
        }
