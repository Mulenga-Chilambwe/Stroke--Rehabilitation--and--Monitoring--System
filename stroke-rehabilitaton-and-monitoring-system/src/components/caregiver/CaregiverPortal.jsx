import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { PageWrapper } from '../shared/UI';
import CaregiverDashboard from '../../pages/caregiver/CaregiverDashboard';
import CaregiverVitals from '../../pages/caregiver/CaregiverVitals';
import Messages from '../shared/Messages';
import '../../styles/caregiver.css';

const NAV_SECTIONS = [
  {
    section: 'Patient Care',
    items: [
      { id: 'dashboard', icon: 'Home', label: 'Wellbeing Overview' },
      { id: 'vitals', icon: 'Vitals', label: 'Log Vitals' },
    ],
  },
  {
    section: 'Communication',
    items: [{ id: 'messages', icon: 'Chat', label: 'Messages' }],
  },
];

const PAGE_TITLES = {
  dashboard: 'Caregiver Wellbeing Dashboard',
  vitals: 'Log Patient Vitals',
  messages: 'Care Team Messages',
};

const CaregiverPortal = () => {
  const { currentUser, logout } = useAuth();
  const [state] = useStore();
  const [page, setPage] = useState('dashboard');
  const patientId = currentUser.patientId || '';

  const unreadCount = state.messages.filter(
    (message) => message.patientId === patientId && message.to === 'caregiver' && !message.read
  ).length;

  const navWithBadge = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.id === 'messages' ? { ...item, badge: unreadCount } : item
    ),
  }));

  const renderPage = () => {
    if (!patientId) {
      return (
        <div className="card anim-fade-up">
          <div className="card__header">
            <span className="card__title">No patient assigned yet</span>
          </div>
          <div className="card__body">
            <p className="text-muted" style={{ lineHeight: 1.7 }}>
              Your caregiver account is active, but patient information will only appear after a patient registers with your caregiver email and the system assigns you to that care record.
            </p>
          </div>
        </div>
      );
    }

    switch (page) {
      case 'dashboard': return <CaregiverDashboard setPage={setPage} />;
      case 'vitals': return <CaregiverVitals />;
      case 'messages': return <Messages currentUser={currentUser} />;
      default: return <CaregiverDashboard setPage={setPage} />;
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
