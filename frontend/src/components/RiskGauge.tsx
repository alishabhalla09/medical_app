import React from 'react';

interface RiskGaugeProps {
  score: number;
  category: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, category }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  // Cap score between 0 and 100
  const cleanScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (cleanScore / 100) * circumference;

  let color = 'var(--success)';
  if (category === 'Medium') {
    color = 'var(--warning)';
  } else if (category === 'High') {
    color = 'var(--danger)';
  }

  return (
    <div className="gauge-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Track circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="gauge-track"
        />
        {/* Dynamic fill circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="gauge-fill"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            filter: `drop-shadow(0px 0px 8px ${color})`
          }}
        />
      </svg>
      <div className="gauge-text">
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 800, 
          fontFamily: 'var(--font-display)', 
          color: color,
        }}>
          {cleanScore}%
        </div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-secondary)',
          marginTop: '2px'
        }}>
          {category} Risk
        </div>
      </div>
    </div>
  );
};
