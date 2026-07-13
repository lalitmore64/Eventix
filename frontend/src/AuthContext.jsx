import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decoded = decodeJwt(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setAuthenticated(true);
        setUsername(decoded.username || null);
        const jwtRoles = decoded.roles || [];
        setRoles(jwtRoles.map(r => r.toLowerCase()));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/v1/auth/login', { username, password });
      const { token: jwtToken, username: userName, role } = res.data;
      
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setAuthenticated(true);
      setUsername(userName);
      setRoles([role.toLowerCase()]);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      setShowAuthModal(false);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please check credentials.' 
      };
    }
  };

  const register = async (username, email, password, role) => {
    try {
      const res = await axios.post('/api/v1/auth/register', { username, email, password, role });
      const { token: jwtToken, username: userName, role: userRole } = res.data;
      
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setAuthenticated(true);
      setUsername(userName);
      setRoles([userRole.toLowerCase()]);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      setShowAuthModal(false);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setAuthenticated(false);
    setUsername(null);
    setRoles([]);
    delete axios.defaults.headers.common['Authorization'];
  };

  const triggerLoginModal = () => {
    setShowAuthModal(true);
  };

  const hasRole = (role) => roles.includes(role.toLowerCase());

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        token,
        username,
        roles,
        login: triggerLoginModal,
        submitLogin: login,
        submitRegister: register,
        logout,
        hasRole,
        loading,
        showAuthModal,
        setShowAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
