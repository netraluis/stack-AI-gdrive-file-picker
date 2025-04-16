'use client';
import { createContext, useContext, useState, useEffect } from 'react';
// Asegúrate de importar el hook
import { useConnections } from '../hooks/useConnections';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
  isLoggedIn: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  authToken: string;
  orgId: string;
  connectionId: string;
  login: (e?: React.FormEvent) => Promise<void>;
  logout: () => void;
  isLoadingConnections: boolean;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('stackaitest@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [orgId, setOrgId] = useState('');
  const [connectionId, setConnectionId] = useState('');

  const { connections, error: connectionError, isLoading: isLoadingConnections } = useConnections(authToken);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedOrgId = localStorage.getItem('orgId');
    const storedEmail = localStorage.getItem('userEmail');

    if (storedToken && storedOrgId) {
      setAuthToken(storedToken);
      setOrgId(storedOrgId);
      if (storedEmail) setEmail(storedEmail);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (connections && connections.length > 0) {
      const driveConnection = connections.find((conn: { connection_provider: string; }) => conn.connection_provider === 'gdrive') || connections[0];
      setConnectionId(driveConnection.connection_id);
    } else if (authToken && connectionError) {
      setError('No Google Drive connections found. Please connect your Google Drive in Stack AI first.');
    }
  }, [connections, authToken, connectionError]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      setAuthToken(data.authToken);
      setOrgId(data.orgId);
      setIsLoggedIn(true);

      localStorage.setItem('authToken', data.authToken);
      localStorage.setItem('orgId', data.orgId);
      localStorage.setItem('userEmail', email);
      
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken('');
    setOrgId('');
    setConnectionId('');
    setIsLoggedIn(false);
    setLoading(false);

    localStorage.removeItem('authToken');
    localStorage.removeItem('orgId');
    localStorage.removeItem('userEmail');
  };

  const value = {
    isLoggedIn,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    setError,
    authToken,
    orgId,
    connectionId,
    login: handleLogin,
    logout: handleLogout,
    isLoadingConnections,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
