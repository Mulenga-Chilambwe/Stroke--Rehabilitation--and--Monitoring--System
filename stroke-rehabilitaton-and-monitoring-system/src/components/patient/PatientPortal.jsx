/**
 * components/patient/PatientPortal.jsx
 * ─────────────────────────────────────────────────────────────
 * Patient portal shell — renders PageWrapper, sidebar navigation,
 * and swaps between dashboard, exercises, recordings, progress,
 * medications, and messages pages.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { PageWrapper } from '../shared/UI';
import PatientDashboard from '../../pages/patient/PatientDashboard';
import PatientExercises from '../../pages/patient/PatientExercises';
import PatientProgress from '../../pages/patient/PatientProgress';
import PatientMedications from '../../pages/patient/PatientMedications';
import PatientRecordings from '../../pages/patient/PatientRecordings';
import Messages from '../shared/Messages';
import '../../styles/patient.css';

const NAV_SECTIONS = [
  {
    section: 'My Care',
    items: [
      { id: 'dashboard', icon: 'Home', label: '' },
      { id: 'exercises', icon: 'Video', label: '' },
      { id: 'recordings', icon: 'Recording', label: '' },
      { id: 'progress', icon: 'Progress', label: '' },
      { id: 'medications', icon: 'Medication', label: '' },
    ],
  },
  {
    section: 'Communication',
    items: [{ id: 'messages', icon: 'Chat', label: '' }],
  },
];

const PAGE_TITLES = {
  dashboard: 'My Recovery Dashboard',
  exercises: 'Remote Physiotherapy Videos',
  recordings: 'Doctor\'s Recorded Sessions',
  progress: 'My Recovery Record',
  medications: 'Medication Tracker',
  messages: 'Messages',
};

const PatientPortal = () => {
  const { currentUser, logout } = useAuth();
  const [state] = useStore();
  const [page, setPage] = useState('dashboard');
  const patientId = currentUser.patientId || 'p1';

  const unreadCount = state.messages.filter(
    (message) => message.patientId === patientId && message.to === 'patient' && !message.read
  ).length;

  const navWithBadge = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.id === 'messages' ? { ...item, badge: unreadCount } : item
    ),
  }));

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <PatientDashboard setPage={setPage} />;
      case 'exercises': return <PatientExercises />;
      case 'recordings': return <PatientRecordings />;
      case 'progress': return <PatientProgress />;
      case 'medications': return <PatientMedications />;
      case 'messages': return <Messages currentUser={currentUser} />;
      default: return <PatientDashboard setPage={setPage} />;
    }
  };

  return (
    <PageWrapper
      user={currentUser}
      page={page}
      setPage={setPage}
      navSections={navWithBadge}
      pageTitle={PAGE_TITLES[page]}
      unreadCount={unreadCount}
      onLogout={logout}
    >
      {renderPage()}
    </PageWrapper>
  );
};

export default PatientPortal;
