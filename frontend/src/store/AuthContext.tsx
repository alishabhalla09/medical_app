import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isDisclaimerAccepted: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  acceptDisclaimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth from localStorage
    const savedToken = localStorage.getItem('aegis_token');
    const savedUser = localStorage.getItem('aegis_user');
    const disclaimerAccepted = localStorage.getItem('aegis_disclaimer_accepted') === 'true';

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('aegis_token');
        localStorage.removeItem('aegis_user');
      }
    }
    
    setIsDisclaimerAccepted(disclaimerAccepted);
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('aegis_token', newToken);
    localStorage.setItem('aegis_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aegis_token');
    localStorage.removeItem('aegis_user');
  };

  const acceptDisclaimer = () => {
    setIsDisclaimerAccepted(true);
    localStorage.setItem('aegis_disclaimer_accepted', 'true');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0f19',
        color: '#00f2fe',
        fontFamily: 'sans-serif',
        fontSize: '1.25rem'
      }}>
        Initializing Aegis Portal...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, isDisclaimerAccepted, login, logout, acceptDisclaimer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
