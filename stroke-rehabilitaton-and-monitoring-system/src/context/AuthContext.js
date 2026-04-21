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

/**
 * AuthProvider
 * Wrap the app root with this (inside StoreProvider).
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  /**
   * login(email, password)
   * Matches credentials against DEMO_USERS.
   * Returns true on success, false on failure.
   */
  const login = (email, password) => {
    const match = Object.values(DEMO_USERS).find(
      (u) => u.email === email && u.password === password
    );
    if (match) {
      setCurrentUser(match);
      return true;
    }
    return false;
  };

  /** Quick login used by the role-selector cards on the login screen. */
  const loginAsRole = (role) => {
    setCurrentUser(DEMO_USERS[role]);
  };

  /** Clear the current session. */
  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, loginAsRole, logout }}>
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
