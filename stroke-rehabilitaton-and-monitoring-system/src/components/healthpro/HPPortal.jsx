/**
 * components/healthpro/HPPortal.jsx
 * Top-level shell for the Health Professional portal.
 */
import React, { useState } from 'react';
import { useStore }    from '../../context/StoreContext';
import { useAuth }     from '../../context/AuthContext';
import { PageWrapper } from '../shared/UI';

// All three HP pages live in one file as named exports
import { HPDashboard, HPExercisePlan, HPReports } from '../../pages/healthpro/HPPages';
import Messages from '../shared/Messages';

import '../../styles/healthpro.css';

const NAV_SECTIONS = [
  {
    section: 'Clinical',
    items: [
      { id: 'dashboard', icon: '📊', label: 'Dashboard'       },
      { id: 'plan',      icon: '💪', label: 'Exercise Plan'   },
      { id: 'reports',   icon: '📋', label: 'Patient Reports' },
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
  dashboard: 'Clinical Dashboard',
  plan:      'Exercise Plan',
  reports:   'Patient Reports',
  messages:  'Messages',
};

const HPPortal = () => {
  const { currentUser, logout } = useAuth();
  const [state]  = useStore();
  const [page, setPage] = useState('dashboard');

  const unreadCount = state.messages.filter(
    (m) => m.to === 'hp' && !m.read
  ).length;

  const navWithBadge = NAV_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.map((item) =>
      item.id === 'messages' ? { ...item, badge: unreadCount } : item
    ),
  }));

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <HPDashboard />;
      case 'plan':      return <HPExercisePlan />;
      case 'reports':   return <HPReports />;
      case 'messages':  return <Messages currentUser={currentUser} />;
      default:          return <HPDashboard />;
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

export default HPPortal;
