import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerModal: React.FC = () => {
  const { isDisclaimerAccepted, acceptDisclaimer } = useAuth();
  const [agreed, setAgreed] = useState(false);

  if (isDisclaimerAccepted) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 7, 12, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '600px',
        width: '100%',
        padding: '32px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 0 50px rgba(239, 68, 68, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '12px',
            borderRadius: '12px',
            color: '#ef4444'
          }}>
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Medical Disclaimer
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
              PLEASE READ CAREFULLY BEFORE PROCEEDING
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px',
          padding: '20px',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          maxHeight: '300px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <p>
            <strong>Aegis Diagnostic Assistant</strong> is an AI-powered diagnostic screening portal intended <strong>strictly for educational, portfolio demonstration, and preliminary risk assessment purposes.</strong>
          </p>
          <p>
            This portal <strong>DOES NOT</strong> perform certified medical diagnoses, clinical reviews, or construct medical treatment pathways. The predictions, scores, and annotations (including heatmap visualizations) are simulated outputs of machine learning models.
          </p>
          <p style={{ color: '#f59e0b', fontWeight: 600 }}>
            Under no circumstances should any result obtained from this tool be used to bypass, modify, or replace consultation with a licensed clinical physician.
          </p>
          <p>
            By checking the box below and clicking 'Proceed', you acknowledge that you understand these limitations and agree not to hold the developers or providers liable for any healthcare decisions made.
          </p>
        </div>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          textTransform: 'none',
          fontSize: '0.95rem',
          color: 'var(--text-primary)',
          fontWeight: 500,
          margin: 0
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              accentColor: '#00f2fe'
            }}
          />
          <span>I understand and explicitly agree to the disclaimer terms.</span>
        </label>

        <button
          className="btn btn-primary"
          disabled={!agreed}
          onClick={acceptDisclaimer}
          style={{
            opacity: agreed ? 1 : 0.5,
            cursor: agreed ? 'pointer' : 'not-allowed',
            padding: '14px 28px',
            fontSize: '1rem',
            width: '100%',
            background: agreed ? undefined : 'rgba(255,255,255,0.05)',
            color: agreed ? undefined : 'var(--text-muted)'
          }}
        >
          Proceed to Dashboard
        </button>
      </div>
    </div>
  );
};
