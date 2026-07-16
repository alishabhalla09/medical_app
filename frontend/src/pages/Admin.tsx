import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { apiClient } from '../api/client';
import { 
  ArrowLeft, 
  Layers,
  Search,
  Database
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [allAssessments, setAllAssessments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not authorized
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'clinician') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const assessments = await apiClient.get('/api/assessments');
        setAllAssessments(assessments);
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const filteredAssessments = allAssessments.filter(a => {
    const val = searchTerm.toLowerCase();
    return (
      a.type.toLowerCase().includes(val) ||
      (a.result.finding && a.result.finding.toLowerCase().includes(val)) ||
      (a.result.category && a.result.category.toLowerCase().includes(val)) ||
      a.id.toString().includes(val)
    );
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex align-center justify-between">
        <div className="flex align-center gap-4">
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={18} />
            Back
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Clinician & Audit Panel</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              System diagnostic metrics, model calibrations, and compliance records.
            </p>
          </div>
        </div>
        
        <span className="badge badge-medium" style={{ padding: '6px 12px' }}>
          Role: {user?.role.toUpperCase()}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary)' }}>
          Loading system registries...
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {/* Left Column: Model Registries & Verification */}
          <div className="glass-panel p-6 flex flex-col gap-6" style={{ gridColumn: 'span 1' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--primary)" />
              Calibrated Models
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex align-center justify-between">
                  <strong style={{ fontSize: '0.9rem' }}>Clinical Diabetes</strong>
                  <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>Active</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Type: Logistic Regression<br/>
                  Parameters: 7 inputs<br/>
                  Calibration: 94.2% ROC AUC
                </div>
              </div>

              <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex align-center justify-between">
                  <strong style={{ fontSize: '0.9rem' }}>Cardiovascular Risk</strong>
                  <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>Active</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Type: Logistic Regression<br/>
                  Parameters: 7 inputs<br/>
                  Calibration: 92.7% ROC AUC
                </div>
              </div>

              <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex align-center justify-between">
                  <strong style={{ fontSize: '0.9rem' }}>CNN Image Classifier</strong>
                  <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>Active</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Architecture: ResNet-18<br/>
                  Attribution: Grad-CAM layer4<br/>
                  Weights: Pretrained ImageNet
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Log Search */}
          <div className="glass-panel p-6 flex flex-col gap-6" style={{ gridColumn: 'span 2' }}>
            <div className="flex align-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} color="var(--primary)" />
                Patient Assessments Registry
              </h3>
              
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Filter logs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '34px', fontSize: '0.8rem', padding: '6px 10px 6px 34px' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Timestamp</th>
                    <th style={{ padding: '12px' }}>Flagged Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No records match filter term.
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map((a) => {
                      const isClinical = a.type.startsWith('clinical');
                      const isHigh = isClinical 
                        ? a.result.category === 'High' 
                        : a.result.finding && (a.result.finding.includes('Risk') || a.result.finding.includes('Pathology') || a.result.finding.includes('Fracture'));
                      
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: isHigh ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>REF-{a.id.toString().padStart(4, '0')}</td>
                          <td style={{ padding: '12px', textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</td>
                          <td style={{ padding: '12px' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge badge-${isHigh ? 'high' : 'low'}`} style={{ fontSize: '0.7rem' }}>
                              {a.result.category || a.result.finding}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
