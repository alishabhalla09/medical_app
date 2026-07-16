import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { 
  ArrowLeft, 
  Activity, 
  Image as ImageIcon, 
  Download, 
  Calendar, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient.get('/api/assessments');
        setAssessments(data);
      } catch (err) {
        console.error("Error fetching assessments history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleDownloadReport = async (id: number, type: string) => {
    try {
      const response = await apiClient.get(`/api/assessments/${id}/report`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Diagnostic_Report_${type}_REF-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Failed to download PDF report", err);
      alert("Failed to download PDF report.");
    }
  };

  const API_STATIC_URL = 'http://127.0.0.1:8000/static';

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="flex align-center gap-4">
        <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={18} />
          Back
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Assessment History Log</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Review past risk evaluations, attributions, and export medical PDF briefs.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary)' }}>
          Loading assessment logs...
        </div>
      ) : assessments.length === 0 ? (
        <div className="glass-panel p-8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No assessments logged. Navigate to Dashboard to run a model check.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {assessments.map((item) => {
            const isClinical = item.type.startsWith('clinical');
            const isExpanded = expandedId === item.id;
            
            // Risk Badge styles
            const isHigh = isClinical 
              ? item.result.category === 'High' 
              : item.result.finding && (item.result.finding.includes('Risk') || item.result.finding.includes('Pathology') || item.result.finding.includes('Fracture'));
              
            const badgeType = isHigh ? 'high' : 'low';
            const badgeLabel = isClinical ? `${item.result.risk_score}% (${item.result.category})` : item.result.finding;

            return (
              <div key={item.id} className="glass-panel" style={{
                overflow: 'hidden',
                borderLeft: `4px solid ${isHigh ? 'var(--danger)' : 'var(--primary)'}`
              }}>
                {/* Panel Header Summary */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div className="flex align-center gap-4">
                    <div style={{
                      backgroundColor: isClinical ? 'rgba(0, 242, 254, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                      color: isClinical ? 'var(--primary)' : 'var(--accent)',
                      padding: '10px',
                      borderRadius: '8px'
                    }}>
                      {isClinical ? <Activity size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {item.type.replace('_', ' ')} Assessment
                      </h4>
                      <div className="flex align-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <Calendar size={12} />
                        {new Date(item.created_at).toLocaleString()}
                        <span>•</span>
                        <span>Ref: REF-{item.id.toString().padStart(4, '0')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex align-center gap-4" style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
                    <span className={`badge badge-${badgeType}`}>
                      {badgeLabel}
                    </span>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleDownloadReport(item.id, item.type)}
                      style={{ padding: '6px 10px' }}
                      title="Download PDF report"
                    >
                      <Download size={14} />
                    </button>
                    <button 
                      onClick={() => toggleExpand(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div style={{
                    padding: '0 24px 24px 24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {isClinical ? (
                        /* Clinical inputs summary */
                        <div>
                          <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Patient Input Parameters
                          </h5>
                          <div className="grid grid-cols-3 gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                            {Object.entries(item.input_data).map(([key, val]: any) => (
                              <div key={key} className="glass-card" style={{ padding: '10px 14px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                  {key.replace('_', ' ')}
                                </div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>
                                  {typeof val === 'number' && val % 1 !== 0 ? val.toFixed(2) : val}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Image thumbnail and heatmap */
                        <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
                          {item.images && (
                            <>
                              <div style={{ flex: 1, minWidth: '180px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>ORIGINAL SCAN:</div>
                                <img 
                                  src={`${API_STATIC_URL}/uploads/${item.images.original_path}`} 
                                  alt="Original input"
                                  style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-glass)' }}
                                />
                              </div>
                              <div style={{ flex: 1, minWidth: '180px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GRAD-CAM HEATMAP:</div>
                                <img 
                                  src={`${API_STATIC_URL}/annotated/${item.images.annotated_path}`} 
                                  alt="Grad-CAM activation overlay"
                                  style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-glass)' }}
                                />
                              </div>
                            </>
                          )}
                          <div style={{ flex: 2, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MODEL RECOMMENDATION:</div>
                            <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                              {item.result.recommendation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
