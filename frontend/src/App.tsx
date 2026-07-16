import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Assessment } from './pages/Assessment';
import { ImageAssessment } from './pages/ImageAssessment';
import { History } from './pages/History';
import { Admin } from './pages/Admin';
import { DisclaimerModal } from './components/DisclaimerModal';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Image as ImageIcon, 
  History as HistoryIcon, 
  ShieldAlert, 
  LogOut,
  User as UserIcon
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Disclaimer Modal triggers at mount if not accepted */}
      <DisclaimerModal />

      {/* Top Navbar */}
      <header className="glass-panel" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderRadius: 0,
        borderWidth: '0 0 1px 0',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-primary)' }}>
          <div style={{ color: 'var(--primary)' }}>
            <ShieldCheck size={28} style={{ filter: 'drop-shadow(0 0 6px var(--primary-glow))' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Aegis Diagnostic
          </h2>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          
          <Link to="/image-assessment" className={`nav-link ${location.pathname === '/image-assessment' ? 'active' : ''}`}>
            <ImageIcon size={18} />
            Image Scan
          </Link>

          <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>
            <HistoryIcon size={18} />
            History Log
          </Link>

          {(user?.role === 'admin' || user?.role === 'clinician') && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              <ShieldAlert size={18} />
              Audit Panel
            </Link>
          )}
        </nav>

        {/* User profile dropdown & logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRight: '1px solid var(--border-glass)' }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '6px',
              borderRadius: '50%',
              color: 'var(--primary)'
            }}>
              <UserIcon size={16} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user?.role.toUpperCase()}</div>
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={logout}
            style={{ padding: '8px 12px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '40px' }}>
        {children}
      </main>
      
      {/* Footer */}
      <footer style={{
        padding: '24px 40px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-glass)'
      }}>
        © {new Date().getFullYear()} Aegis Diagnostic Assistant. Educational Portfolio Project. All assessment indices are simulated logs.
      </footer>
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/image-assessment" element={<ImageAssessment />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AuthenticatedApp />
      </Router>
    </AuthProvider>
  );
};

export default App;
