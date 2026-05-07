import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for token on mount
    const storedUser = sessionStorage.getItem('adminUser');
    const token = sessionStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        logout();
      }
    }
    setLoading(false);

    // Listen for 401 Unauthorized events from axios
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    const resData = res.data;
    if (resData.success && resData.data.token) {
      setUser({ id: resData.data.id, username: resData.data.username });
      sessionStorage.setItem('token', resData.data.token);
      sessionStorage.setItem('adminUser', JSON.stringify({ id: resData.data.id, username: resData.data.username }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
