/**
 * context/AuthContext.js
 * ─────────────────────────────────────────────────────────────
 * Manages which user is currently logged in.
 * Provides `useAuth()` hook to any component that needs the
 * current user object or the login / logout functions.
 * ─────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useState } from 'react';
import { DEMO_USERS } from '../data/mockData';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authRequest = async (path, body) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {
    throw new Error('Cannot reach the backend. Start the Node server and try again.');
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed.');
  }

  return data;
};

/**
 * AuthProvider
 * Wrap the app root with this (inside StoreProvider).
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('strokeRehabUser');
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('strokeRehabUser');
      localStorage.removeItem('strokeRehabToken');
      return null;
    }
  });

  const saveSession = ({ token, user }) => {
    localStorage.setItem('strokeRehabToken', token);
    localStorage.setItem('strokeRehabUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  /**
   * login(email, password)
   * Authenticates against the Node backend.
   */
  const login = async (email, password) => {
    try {
      const data = await authRequest('/users/login', { email, password });
      saveSession(data);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  /** Quick login used by the role-selector cards on the login screen. */
  const loginAsRole = (role) => {
    const demoUser = DEMO_USERS[role];
    const { password, ...publicDemoUser } = demoUser;
    setCurrentUser(publicDemoUser);
  };

  const register = async ({ name, email, password, role }) => {
    try {
      const data = await authRequest('/users/register', { name, email, password, role });
      saveSession(data);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  /** Clear the current session. */
  const logout = () => {
    localStorage.removeItem('strokeRehabToken');
    localStorage.removeItem('strokeRehabUser');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, loginAsRole, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth()
 * Returns { currentUser, login, loginAsRole, logout }
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
