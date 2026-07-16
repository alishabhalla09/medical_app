import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ShieldCheck, User, Mail, Lock, UserCheck, Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post('/api/auth/register', { name, email, password, role });
      // Redirect to login after successful register
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            padding: '12px',
            borderRadius: '16px',
            color: '#0b0f19',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)'
          }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Register to access diagnostic screening models
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: 'var(--danger)',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="name">Full Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="role">User Role</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <UserCheck size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', zIndex: 10 }} />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ paddingLeft: '44px', cursor: 'pointer' }}
              >
                <option value="patient">Patient (Risk Screening)</option>
                <option value="clinician">Clinician (Review Panel)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '12px' }}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Registering...
              </>
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
