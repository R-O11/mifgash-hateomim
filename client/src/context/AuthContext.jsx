import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for token on mount
    const storedUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('token');
    
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
    const res = await api.adminLogin({ username, password });
    if (res.success && res.data.token) {
      setUser({ id: res.data.id, username: res.data.username });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify({ id: res.data.id, username: res.data.username }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
