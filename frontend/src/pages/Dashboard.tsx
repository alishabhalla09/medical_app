import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { apiClient } from '../api/client';
import { 
  Activity, 
  Image as ImageIcon, 
  Users, 
  CheckSquare, 
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'admin' || user?.role === 'clinician') {
          const stats = await apiClient.get('/api/assessments/admin/stats');
          setAdminStats(stats);
        }
        const pastAssessments = await apiClient.get('/api/assessments');
        setHistory(pastAssessments.slice(0, 5)); // Get recent 5
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Statistics calculation for patients
  const patientTotal = history.length;
  const highRiskAssessments = history.filter(a => {
    if (a.type.startsWith('clinical')) return a.result.category === 'High';
    return a.result.finding && (a.result.finding.includes('Risk') || a.result.finding.includes('Pathology'));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '20px 0' }}>
      {/* Header Info */}
      <div className="glass-panel p-8" style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(20, 26, 45, 0.8) 0%, rgba(10, 15, 25, 0.8) 100%)',
      }}>
        {/* Glow overlay */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-medium" style={{ marginBottom: '12px' }}>
            Aegis Intelligence Platform
          </span>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.5' }}>
            Access clinical risk screening models and neural networks for medical anomaly evaluations. Keep track of screening histories and export clinical review sheets.
          </p>
        </div>
      </div>

      {/* Admin/Clinician Statistics Section */}
      {(user?.role === 'admin' || user?.role === 'clinician') && adminStats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--primary)" />
            Clinical Platform Statistics
          </h2>
          <div className="grid grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="glass-card flex align-center gap-4">
              <div style={{ backgroundColor: 'rgba(0, 242, 254, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{adminStats.total_users}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Registered Patients</div>
              </div>
            </div>

            <div className="glass-card flex align-center gap-4">
              <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent)' }}>
                <CheckSquare size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{adminStats.total_assessments}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Evaluations Executed</div>
              </div>
            </div>

            <div className="glass-card flex align-center gap-4" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--danger)' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)' }}>{adminStats.high_risk_flagged}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>High Risk Flags Active</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Actions Panel */}
      <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Action 1: Clinical forms */}
        <div className="glass-panel p-6 flex flex-col justify-between" style={{ gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary)', padding: '10px', borderRadius: '8px' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Clinical Parameter Assessment</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Input diagnostic criteria including blood pressure, glucose, BMI, and cholesterol to execute Logistic Regression models for diabetes or cardiovascular risk scoring.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/assessment?type=diabetes" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
              Diabetes Screen
            </Link>
            <Link to="/assessment?type=heart" className="btn btn-secondary" style={{ flex: 1, padding: '10px' }}>
              Heart Screen
            </Link>
          </div>
        </div>

        {/* Action 2: Image Upload / Webcam */}
        <div className="glass-panel p-6 flex flex-col justify-between" style={{ gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)', padding: '10px', borderRadius: '8px' }}>
                <ImageIcon size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Imaging Pathology Screening</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Upload chest X-ray scans or take a dermal webcam capture to process through convolutional neural networks (CNNs), generating Grad-CAM heatmaps for anatomical abnormalities.
            </p>
          </div>
          <Link to="/image-assessment" className="btn btn-primary" style={{ width: '100%' }}>
            Initiate Image Scan
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Patient Specific Past assessments & Timeline */}
      {user?.role === 'patient' && (
        <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {/* Patient Quick stats */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 style={{ fontSize: '1.15rem' }}>Your Screening Summary</h3>
            <div className="grid grid-cols-2 gap-4" style={{ marginTop: '10px' }}>
              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{patientTotal}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed Assessments</div>
              </div>
              <div style={{ borderLeft: '3px solid var(--danger)', paddingLeft: '12px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{highRiskAssessments.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>High Risk Flags</div>
              </div>
            </div>
            {history.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '12px',
                border: '1px solid var(--border-glass)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>LATEST SCREENING RESULT</div>
                <div className="flex align-center justify-between">
                  <span style={{ fontWeight: 600 }}>
                    {history[0].type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`badge badge-${(history[0].result.category || (history[0].result.finding && (history[0].result.finding.includes('Risk') || history[0].result.finding.includes('Pathology') || history[0].result.finding.includes('Fracture'))) ? 'high' : 'low').toLowerCase()}`}>
                    {history[0].result.category || history[0].result.finding}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Recent History Timeline */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex align-center justify-between">
              <h3 style={{ fontSize: '1.15rem' }}>Recent Assessments</h3>
              <Link to="/history" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                View All
              </Link>
            </div>
            {history.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '30px 0',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}>
                No assessments logged. Start your first health screen above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map((item) => (
                  <div key={item.id} className="flex align-center justify-between" style={{
                    paddingBottom: '12px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.type.replace('_', ' ').title || item.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className={`badge badge-${(item.result.category || (item.result.finding && (item.result.finding.includes('Risk') || item.result.finding.includes('Pathology') || item.result.finding.includes('Fracture'))) ? 'high' : 'low').toLowerCase()}`}>
                        {item.result.category || (item.result.finding ? item.result.finding.split('/')[0] : 'Normal')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
