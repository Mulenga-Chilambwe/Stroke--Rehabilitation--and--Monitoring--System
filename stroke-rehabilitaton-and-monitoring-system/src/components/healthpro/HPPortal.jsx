/**
 * components/healthpro/HPPortal.jsx
 * ─────────────────────────────────────────────────────────────
 * Health Professional portal shell — renders PageWrapper,
 * sidebar navigation, availability toggle, and swaps between
 * dashboard, exercise plan, reports, recordings, and messages.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, PageWrapper } from '../shared/UI';
import { HPDashboard, HPExercisePlan, HPReports, HPRecordings } from '../../pages/healthpro/HPPages';
import HPProfile from '../../pages/healthpro/HPProfile';
import Messages from '../shared/Messages';
import '../../styles/healthpro.css';

const NAV_SECTIONS = [
  {
    section: 'Clinical',
    items: [
      { id: 'dashboard', icon: 'Dashboard', label: '' },
      { id: 'plan', icon: 'Plan', label: '' },
      { id: 'reports', icon: 'Report', label: '' },
    ],
  },
  {
    section: 'Therapy Media',
    items: [{ id: 'recordings', icon: 'Recording', label: '' }],
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
  dashboard: 'Clinical Dashboard',
  plan: 'Exercise Assignment',
  reports: 'Weekly Patient Activity',
  recordings: 'Recorded Therapy Sessions',
  profile: 'My Professional Profile',
  messages: 'Care Team Messages',
};

const HPPortal = () => {
  const { currentUser, logout, updateDoctorAvailability } = useAuth();
  const [state, dispatch] = useStore();
  const [page, setPage] = useState('dashboard');
  const unreadCount = state.messages.filter((message) => message.to === 'hp' && !message.read).length;
  const isAvailable = currentUser.isAvailable !== false;

  const toggleAvailability = async () => {
    const nextAvailability = !isAvailable;
    const result = await updateDoctorAvailability(nextAvailability);
    const updatedUser = result.user || { ...currentUser, isAvailable: nextAvailability };

    dispatch((s) => ({
      ...s,
      doctors: s.doctors.map((doctor) =>
        doctor.id === updatedUser.doctorId
          ? { ...doctor, isAvailable: nextAvailability }
          : doctor
      ),
    }));
  };

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
      case 'recordings': return <HPRecordings />;
      case 'profile': return <HPProfile />;
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
      <div className="doctor-toolbar anim-fade-up" style={{ marginBottom: 18 }}>
        <Alert variant={isAvailable ? 'success' : 'warn'} icon="Status" style={{ margin: 0, flex: 1 }}>
          Your registration availability is <strong>{isAvailable ? 'on' : 'off'}</strong>.
        </Alert>
        <button
          type="button"
          className={`btn ${isAvailable ? 'btn--outline' : 'btn--primary'} btn--sm`}
          onClick={toggleAvailability}
        >
          {isAvailable ? 'Turn Off Availability' : 'Turn On Availability'}
        </button>
      </div>
      {renderPage()}
    </PageWrapper>
  );
};

export default HPPortal;
