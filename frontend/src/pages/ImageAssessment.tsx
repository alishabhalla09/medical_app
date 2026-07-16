import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { WebcamCapture } from '../components/WebcamCapture';
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  Loader2, 
  AlertTriangle, 
  Download, 
  Eye
} from 'lucide-react';

export const ImageAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);

  // Results tab view (original vs Grad-CAM overlay)
  const [activeTab, setActiveTab] = useState<'original' | 'heatmap'>('heatmap');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleWebcamCapture = (blob: Blob) => {
    // Generate preview
    setPreview(URL.createObjectURL(blob));
    // Convert Blob to File object to reuse file upload submission pipeline
    const webcamFile = new File([blob], "webcam_snap.png", { type: "image/png" });
    setFile(webcamFile);
    setShowWebcam(false);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', file.name === "webcam_snap.png" ? "webcam" : "upload");

    try {
      const data = await apiClient.post('/api/predict/image', formData);
      setResult(data);
      setActiveTab('heatmap'); // Default to heatmap overlay on complete
    } catch (err: any) {
      setError(err.message || 'Image prediction failed. Make sure server is active.');
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
      link.setAttribute('download', `Diagnostic_Report_Image_REF-${result.id}.pdf`);
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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="flex align-center gap-4">
        <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={18} />
          Back
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Visual Pathology Screening</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Upload scans or capture photos to generate CNN classification results and Grad-CAM saliency heatmaps.
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

      {/* Main Content Split */}
      <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        {/* Left Side: Upload & Action Panel */}
        <div className="glass-panel p-6 flex flex-col gap-6" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem' }}>Input Source</h3>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed var(--border-glass)',
              borderRadius: '12px',
              padding: '30px 10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              margin: 0
            }} className="glass-card">
              <Upload size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Scan File</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>PNG/JPG up to 10MB</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>

            <button 
              className="glass-card" 
              onClick={() => setShowWebcam(true)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                cursor: 'pointer',
                padding: '30px 10px'
              }}
            >
              <Camera size={24} color="var(--accent)" style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Webcam Capture</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Trigger camera overlay</span>
            </button>
          </div>

          {preview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Target Image Preview:
              </div>
              <div style={{
                position: 'relative',
                width: '100%',
                maxHeight: '260px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-glass)'
              }}>
                <img 
                  src={preview} 
                  alt="Source preview" 
                  style={{ width: '100%', height: '100%', maxHeight: '260px', objectFit: 'contain', backgroundColor: '#05070c' }}
                />
              </div>
              <button 
                onClick={handleSubmit} 
                className="btn btn-primary" 
                disabled={loading}
                style={{ marginTop: '6px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    AI Analyzing Features...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: ML Results Panel */}
        <div className="glass-panel p-6 flex flex-col gap-6" style={{ minHeight: '350px', justifyContent: result ? 'flex-start' : 'center', alignItems: result ? 'stretch' : 'center' }}>
          {!result ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
              <Eye size={40} style={{ margin: '0 auto', color: 'rgba(255,255,255,0.05)' }} />
              <p style={{ fontSize: '0.95rem' }}>Provide an input image to trigger the neural network prediction layer.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span className="badge badge-high" style={{ marginBottom: '8px' }}>
                  ResNet18 Diagnostic Scan
                </span>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                  {result.result.finding}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Model Confidence:</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{result.result.confidence}%</strong>
                </div>
              </div>

              {/* Image Tabs (Original vs Heatmap) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '4px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)'
                }}>
                  <button 
                    onClick={() => setActiveTab('heatmap')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: activeTab === 'heatmap' ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                      color: activeTab === 'heatmap' ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                  >
                    Grad-CAM Heatmap Focus
                  </button>
                  <button 
                    onClick={() => setActiveTab('original')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: activeTab === 'original' ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: activeTab === 'original' ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    Original Image
                  </button>
                </div>

                <div style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: '#05070c'
                }}>
                  {activeTab === 'heatmap' ? (
                    <img 
                      src={`${API_STATIC_URL}/annotated/${result.images.annotated_path}`}
                      alt="Grad-CAM activation overlay"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <img 
                      src={`${API_STATIC_URL}/uploads/${result.images.original_path}`}
                      alt="Original uploaded"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  General Guidance
                </h4>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                  {result.result.recommendation}
                </p>
              </div>

              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <AlertTriangle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <strong>Legal disclaimer:</strong> Heatmap activations highlight spatial features triggering the neural weights. This does not verify specific clinical diagnostic markers. Refer to doctor.
                </p>
              </div>

              <button className="btn btn-primary" onClick={handleDownloadReport} style={{ width: '100%' }}>
                <Download size={18} />
                Download Report PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {showWebcam && (
        <WebcamCapture 
          onCapture={handleWebcamCapture} 
          onClose={() => setShowWebcam(false)} 
        />
      )}
    </div>
  );
};
