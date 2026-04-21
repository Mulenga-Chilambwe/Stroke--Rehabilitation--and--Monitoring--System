/**
 * components/patient/PatientPortal.jsx
 * ─────────────────────────────────────────────────────────────
 * Top-level shell for the Patient portal.
 *
 * Responsibilities:
 *   • Owns the active-page state for this portal
 *   • Defines the sidebar navigation items
 *   • Applies the patient colour theme via CSS variables
 *   • Renders the correct page component based on active page
 *   • Passes unread-message count to the Topbar bell
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';

import { useStore }   from '../../context/StoreContext';
import { useAuth }    from '../../context/AuthContext';
import { PageWrapper } from '../shared/UI';

/* Page components */
import PatientDashboard from '../../pages/patient/PatientDashboard';
import PatientExercises from '../../pages/patient/PatientExercises';
import PatientProgress  from '../../pages/patient/PatientProgress';
import Messages         from '../shared/Messages';

/* Patient-specific styles (overrides CSS variables) */
import '../../styles/patient.css';

/* ── Sidebar nav config ── */
const NAV_SECTIONS = [
  {
    section: 'My Care',
    items: [
      { id: 'dashboard',  icon: '🏠', label: 'Dashboard'    },
      { id: 'exercises',  icon: '💪', label: 'My Exercises' },
      { id: 'progress',   icon: '📈', label: 'My Progress'  },
    ],
  },
  {
    section: 'Communication',
    items: [
      { id: 'messages', icon: '💬', label: 'Messages' },
    ],
  },
];

/* Human-readable page titles shown in the Topbar */
const PAGE_TITLES = {
  dashboard:  'My Dashboard',
  exercises:  'My Exercises',
  progress:   'My Progress',
  messages:   'Messages',
};

const PatientPortal = () => {
  const { currentUser, logout } = useAuth();
  const [state]                 = useStore();
  const [page, setPage]         = useState('dashboard');

  /* Unread messages addressed to 'patient' */
  const unreadCount = state.messages.filter(
    (m) => m.to === 'patient' && !m.read
  ).length;

  /* Badge on the nav item */
  const navWithBadge = NAV_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.map((item) =>
      item.id === 'messages' ? { ...item, badge: unreadCount } : item
    ),
  }));

  /* Render the active page */
  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <PatientDashboard setPage={setPage} />;
      case 'exercises':  return <PatientExercises />;
      case 'progress':   return <PatientProgress />;
      case 'messages':   return <Messages currentUser={currentUser} />;
      default:           return <PatientDashboard setPage={setPage} />;
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
