import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { RiskGauge } from '../components/RiskGauge';
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  Download,
  Info
} from 'lucide-react';

export const Assessment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'diabetes';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  // Form states for Diabetes
  const [diabetesData, setDiabetesData] = useState({
    glucose: 120,
    bmi: 28.5,
    age: 45,
    blood_pressure: 80,
    insulin: 85,
    pregnancies: 0,
    family_history: 0.25
  });

  // Form states for Heart Disease
  const [heartData, setHeartData] = useState({
    age: 55,
    cholesterol: 220,
    resting_bp: 130,
    max_heart_rate: 140,
    chest_pain_type: 0, // 0-3
    ecg_results: 0, // 0-2
    exercise_angina: 0 // 0-1
  });

  useEffect(() => {
    // Reset result when screen flips
    setResult(null);
    setError(null);
  }, [type]);

  const handleDiabetesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDiabetesData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleHeartChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHeartData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let data;
      if (type === 'diabetes') {
        data = await apiClient.post('/api/predict/clinical/diabetes', diabetesData);
      } else {
        data = await apiClient.post('/api/predict/clinical/heart', heartData);
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Verify input parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    try {
      const response = await apiClient.get(`/api/assessments/${result.id}/report`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Diagnostic_Report_${type}_REF-${result.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Failed to download PDF report", err);
      alert("Failed to download PDF report.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="flex align-center gap-4">
        <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={18} />
          Back
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', textTransform: 'capitalize' }}>
            {type === 'diabetes' ? 'Diabetes Risk Screening' : 'Cardiovascular Risk Screening'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Provide clinical metrics for predictive logistic intelligence.
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          color: 'var(--danger)',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {!result ? (
        <form onSubmit={handleSubmit} className="glass-panel p-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {type === 'diabetes' ? (
            /* Diabetes Fields */
            <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div>
                <label>Glucose Level (mg/dL)</label>
                <input
                  type="number"
                  name="glucose"
                  value={diabetesData.glucose}
                  onChange={handleDiabetesChange}
                  min="40"
                  max="400"
                  required
                />
              </div>

              <div>
                <label>BMI (kg/m²)</label>
                <input
                  type="number"
                  name="bmi"
                  value={diabetesData.bmi}
                  onChange={handleDiabetesChange}
                  step="0.1"
                  min="10"
                  max="80"
                  required
                />
              </div>

              <div>
                <label>Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={diabetesData.age}
                  onChange={handleDiabetesChange}
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div>
                <label>Blood Pressure (Diastolic mmHg)</label>
                <input
                  type="number"
                  name="blood_pressure"
                  value={diabetesData.blood_pressure}
                  onChange={handleDiabetesChange}
                  min="30"
                  max="200"
                  required
                />
              </div>

              <div>
                <label>Insulin (uU/mL)</label>
                <input
                  type="number"
                  name="insulin"
                  value={diabetesData.insulin}
                  onChange={handleDiabetesChange}
                  min="0"
                  max="800"
                  required
                />
              </div>

              <div>
                <label>Pregnancies</label>
                <input
                  type="number"
                  name="pregnancies"
                  value={diabetesData.pregnancies}
                  onChange={handleDiabetesChange}
                  min="0"
                  max="20"
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label>Diabetes Family History Index (0.0 - 1.0)</label>
                <input
                  type="range"
                  name="family_history"
                  value={diabetesData.family_history}
                  onChange={handleDiabetesChange}
                  min="0"
                  max="1.0"
                  step="0.01"
                  style={{ cursor: 'pointer', padding: 0 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <span>No Family History (0.0)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{diabetesData.family_history}</span>
                  <span>Strong Pedigree History (1.0)</span>
                </div>
              </div>
            </div>
          ) : (
            /* Heart Disease Fields */
            <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div>
                <label>Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={heartData.age}
                  onChange={handleHeartChange}
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div>
                <label>Serum Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  name="cholesterol"
                  value={heartData.cholesterol}
                  onChange={handleHeartChange}
                  min="80"
                  max="600"
                  required
                />
              </div>

              <div>
                <label>Resting Blood Pressure (mmHg)</label>
                <input
                  type="number"
                  name="resting_bp"
                  value={heartData.resting_bp}
                  onChange={handleHeartChange}
                  min="60"
                  max="240"
                  required
                />
              </div>

              <div>
                <label>Max Heart Rate (bpm)</label>
                <input
                  type="number"
                  name="max_heart_rate"
                  value={heartData.max_heart_rate}
                  onChange={handleHeartChange}
                  min="50"
                  max="250"
                  required
                />
              </div>

              <div>
                <label>Chest Pain Type</label>
                <select
                  name="chest_pain_type"
                  value={heartData.chest_pain_type}
                  onChange={handleHeartChange}
                >
                  <option value={0}>Typical Angina</option>
                  <option value={1}>Atypical Angina</option>
                  <option value={2}>Non-anginal Pain</option>
                  <option value={3}>Asymptomatic</option>
                </select>
              </div>

              <div>
                <label>Resting ECG Results</label>
                <select
                  name="ecg_results"
                  value={heartData.ecg_results}
                  onChange={handleHeartChange}
                >
                  <option value={0}>Normal</option>
                  <option value={1}>ST-T Wave Abnormality</option>
                  <option value={2}>Left Ventricular Hypertrophy</option>
                </select>
              </div>

              <div>
                <label>Exercise-Induced Angina</label>
                <select
                  name="exercise_angina"
                  value={heartData.exercise_angina}
                  onChange={handleHeartChange}
                >
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '14px 32px' }}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing Clinical Data...
              </>
            ) : (
              'Run Risk Model'
            )}
          </button>
        </form>
      ) : (
        /* Results View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel p-8 flex flex-col align-center text-center" style={{ gap: '24px' }}>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>
              Risk Assessment Complete
            </h3>
            
            <RiskGauge score={result.result.risk_score} category={result.result.category} />

            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: '500px',
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              textAlign: 'left'
            }}>
              <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Safety Advisory Disclaimer
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  This screening score is a statistical probability outputted by a logistic classifier. It is not an official medical diagnostic validation. Seek professional clinician verification.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="btn btn-secondary" onClick={() => setResult(null)}>
                New Assessment
              </button>
              <button className="btn btn-primary" onClick={handleDownloadReport}>
                <Download size={18} />
                Download Report PDF
              </button>
            </div>
          </div>

          {/* Attributions Table */}
          <div className="glass-panel p-6">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={18} color="var(--primary)" />
              Contributing Clinical Attribution (SHAP-like variables)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Parameter</th>
                    <th style={{ padding: '12px' }}>Your Value</th>
                    <th style={{ padding: '12px' }}>Risk Impact Direction</th>
                    <th style={{ padding: '12px' }}>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {result.result.contributions.map((item: any, index: number) => {
                    const isInc = item.impact > 0.05;
                    const isDec = item.impact < -0.05;
                    const color = isInc ? 'var(--danger)' : isDec ? 'var(--success)' : 'var(--text-muted)';
                    return (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                          {item.feature.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '12px' }}>{item.value}</td>
                        <td style={{ padding: '12px', color: color, fontWeight: 500 }}>
                          {item.direction} ({item.impact > 0 ? `+${item.impact.toFixed(2)}` : item.impact.toFixed(2)})
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.normal_reference}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
