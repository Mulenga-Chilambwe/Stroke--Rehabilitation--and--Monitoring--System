import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { PageWrapper } from '../shared/UI';
import { HPDashboard, HPExercisePlan, HPReports } from '../../pages/healthpro/HPPages';
import Messages from '../shared/Messages';
import '../../styles/healthpro.css';

const NAV_SECTIONS = [
  {
    section: 'Clinical',
    items: [
      { id: 'dashboard', icon: 'Dash', label: 'Dashboard' },
      { id: 'plan', icon: 'Plan', label: 'Assign Exercises' },
      { id: 'reports', icon: 'Report', label: 'Patient Reports' },
    ],
  },
  {
    section: 'Communication',
    items: [{ id: 'messages', icon: 'Chat', label: 'Messages' }],
  },
];

const PAGE_TITLES = {
  dashboard: 'Clinical Dashboard',
  plan: 'Exercise Assignment',
  reports: 'Weekly Patient Activity',
  messages: 'Care Team Messages',
};

const HPPortal = () => {
  const { currentUser, logout } = useAuth();
  const [state] = useStore();
  const [page, setPage] = useState('dashboard');
  const unreadCount = state.messages.filter((message) => message.to === 'hp' && !message.read).length;

  const navWithBadge = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.id === 'messages' ? { ...item, badge: unreadCount } : item
    ),
  }));

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <HPDashboard />;
      case 'plan': return <HPExercisePlan />;
      case 'reports': return <HPReports />;
      case 'messages': return <Messages currentUser={currentUser} />;
      default: return <HPDashboard />;
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
