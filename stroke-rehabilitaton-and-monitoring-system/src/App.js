/**
 * App.js
 * Root component — mounts providers and routes to the correct
 * portal based on the logged-in user's role.
 */
import React from 'react';
import { StoreProvider }         from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login           from './components/Login';
import PatientPortal   from './components/patient/PatientPortal';
import CaregiverPortal from './components/caregiver/CaregiverPortal';
import HPPortal        from './components/healthpro/HPPortal';

import './styles/globals.css';
import './styles/shared.css';

const AppRouter = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Login />;
  switch (currentUser.role) {
    case 'patient':   return <PatientPortal />;
    case 'caregiver': return <CaregiverPortal />;
    case 'hp':        return <HPPortal />;
    default:          return <Login />;
  }
};

const App = () => (
  <StoreProvider>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StoreProvider>
);

export default App;
