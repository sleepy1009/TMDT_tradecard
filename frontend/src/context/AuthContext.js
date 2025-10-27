import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (tokenParam) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${tokenParam}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const userData = await res.json();
      setUser(userData);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const login = (authData) => {
    const { token } = authData;
    localStorage.setItem('token', token);
    setToken(token);
    fetchUserProfile(token);
    navigate('/account');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const updateUser = async (newData) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Update failed');
      setUser(result.user);
      return true;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    }
  }, [fetchUserProfile]);

  const value = {
    token,
    user,
    login,
    logout,
    updateUser,
    fetchUserProfile 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};