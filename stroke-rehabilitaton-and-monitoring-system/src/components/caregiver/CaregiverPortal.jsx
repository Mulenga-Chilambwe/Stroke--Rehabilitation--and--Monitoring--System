/**
 * components/caregiver/CaregiverPortal.jsx
 * ─────────────────────────────────────────────────────────────
 * Caregiver portal shell — renders PageWrapper, sidebar navigation,
 * and swaps between dashboard, recordings, vitals, and messages pages.
 * Shows "No patient assigned" if no patientId is linked.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { PageWrapper } from '../shared/UI';
import CaregiverDashboard from '../../pages/caregiver/CaregiverDashboard';
import CaregiverVitals from '../../pages/caregiver/CaregiverVitals';
import CaregiverRecordings from '../../pages/caregiver/CaregiverRecordings';
import CaregiverProfile from '../../pages/caregiver/CaregiverProfile';
import Messages from '../shared/Messages';
import '../../styles/caregiver.css';

const NAV_SECTIONS = [
  {
    section: 'Patient Care',
    items: [
      { id: 'dashboard', icon: 'Home', label: '' },
      { id: 'recordings', icon: 'Recording', label: '' },
      { id: 'vitals', icon: 'Vitals', label: '' },
    ],
  },
  {
    section: 'My Account',
    items: [{ id: 'profile', icon: 'Profile', label: '' }],
  },
  {
    section: 'Communication',
    items: [{ id: 'messages', icon: 'Chat', label: '' }],
  },
];

const PAGE_TITLES = {
  dashboard: 'Caregiver Wellbeing Dashboard',
  recordings: 'Doctor\'s Recorded Sessions',
  vitals: 'Log Patient Vitals',
  profile: 'My Caregiver Profile',
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
      case 'recordings': return <CaregiverRecordings />;
      case 'vitals': return <CaregiverVitals />;
      case 'profile': return <CaregiverProfile />;
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
