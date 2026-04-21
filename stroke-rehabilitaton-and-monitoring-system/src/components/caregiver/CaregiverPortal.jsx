/**
 * components/caregiver/CaregiverPortal.jsx
 * ─────────────────────────────────────────────────────────────
 * Top-level shell for the Caregiver portal.
 *
 * Responsibilities:
 *   • Owns the active-page state for this portal
 *   • Defines the sidebar navigation items
 *   • Applies the caregiver colour theme (amber) via CSS variables
 *   • Renders the correct page component based on active page
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';

import { useStore }    from '../../context/StoreContext';
import { useAuth }     from '../../context/AuthContext';
import { PageWrapper } from '../shared/UI';

/* Page components */
import CaregiverDashboard from '../../pages/caregiver/CaregiverDashboard';
import CaregiverVitals    from '../../pages/caregiver/CaregiverVitals';
import Messages           from '../shared/Messages';

/* Caregiver-specific styles */
import '../../styles/caregiver.css';

/* ── Sidebar nav config ── */
const NAV_SECTIONS = [
  {
    section: 'Patient Care',
    items: [
      { id: 'dashboard', icon: '🏠', label: 'Overview'    },
      { id: 'vitals',    icon: '🩺', label: 'Log Vitals'  },
    ],
  },
  {
    section: 'Communication',
    items: [
      { id: 'messages', icon: '💬', label: 'Messages' },
    ],
  },
];

const PAGE_TITLES = {
  dashboard: 'Caregiver Overview',
  vitals:    'Log Patient Vitals',
  messages:  'Messages',
};

const CaregiverPortal = () => {
  const { currentUser, logout } = useAuth();
  const [state]                 = useStore();
  const [page, setPage]         = useState('dashboard');

  /* Unread messages addressed to 'caregiver' */
  const unreadCount = state.messages.filter(
    (m) => m.to === 'caregiver' && !m.read
  ).length;

  /* Inject badge count into nav */
  const navWithBadge = NAV_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.map((item) =>
      item.id === 'messages' ? { ...item, badge: unreadCount } : item
    ),
  }));

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <CaregiverDashboard />;
      case 'vitals':    return <CaregiverVitals />;
      case 'messages':  return <Messages currentUser={currentUser} />;
      default:          return <CaregiverDashboard />;
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

export default CaregiverPortal;
