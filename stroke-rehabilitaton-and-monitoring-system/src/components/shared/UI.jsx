/**
 * components/shared/UI.jsx
 * ─────────────────────────────────────────────────────────────
 * Re-usable "dumb" UI primitives used by all three portals.
 *
 * Components exported:
 *   Sidebar       – left navigation rail
 *   Topbar        – sticky page header
 *   ProgressBar   – animated fill bar
 *   StatCard      – KPI tile (icon + number)
 *   Badge         – coloured pill label
 *   Alert         – info / warn / danger banner
 *   Modal         – overlay dialog
 *   PageWrapper   – shell (Sidebar + Topbar + content area)
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import '../../styles/shared.css';

// ══════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════
/**
 * Sidebar
 * Props:
 *   user       – { name, avatar, color, role }
 *   page       – current active page id (string)
 *   setPage    – setter to change active page
 *   navSections– [{ section: string, items: [{ id, icon, label, badge? }] }]
 *   onLogout   – callback
 */
export const Sidebar = ({ user, page, setPage, navSections, onLogout }) => {
  const roleLabel =
    user.role === 'hp'
      ? 'Health Professional'
      : user.role === 'caregiver'
      ? 'Caregiver'
      : 'Patient';

  return (
    <nav className="sidebar">
      {/* ── Brand ── */}
      <div className="sidebar__logo">
        <h1>
          Stroke<span>Rehab</span>
        </h1>
        <p>Copperbelt University</p>
        <span className="sidebar__role-badge">{roleLabel}</span>
      </div>

      {/* ── Nav sections ── */}
      <div className="sidebar__nav">
        {navSections.map((section) => (
          <div key={section.section}>
            <div className="sidebar__section-label">{section.section}</div>
            {section.items.map((item) => (
              <div
                key={item.id}
                className={`sidebar__item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setPage(item.id)}
              >
                <span className="sidebar__item-icon">{item.icon}</span>
                <span className="sidebar__item-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="sidebar__item-badge">{item.badge}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── User footer ── */}
      <div className="sidebar__footer">
        <div
          className="sidebar__avatar"
          style={{ background: user.color }}
        >
          {user.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar__user-name">{user.name}</div>
          <div className="sidebar__user-role">{roleLabel}</div>
        </div>
        <button
          className="sidebar__logout"
          onClick={onLogout}
          title="Log out"
        >
          ⎋
        </button>
      </div>
    </nav>
  );
};

// ══════════════════════════════════════════
// TOPBAR
// ══════════════════════════════════════════
/**
 * Topbar
 * Props:
 *   title      – page heading string
 *   user       – current user object
 *   unreadCount– number of unread messages (shows dot on bell)
 *   onBellClick– opens messages page
 */
export const Topbar = ({ title, user, unreadCount = 0, onBellClick }) => {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const [syncTime, setSyncTime] = useState('Live');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('strokeRehabToken');
      if (token && token !== 'demo-offline-token' && navigator.onLine) {
        setSyncTime(new Date().toLocaleTimeString());
      } else {
        setSyncTime('Offline');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="topbar">
      <h2 className="topbar__title">{title}</h2>

      <div className="topbar__right">
        <div className="sync-chip">
          <span className={`sync-dot ${isOnline && syncTime !== 'Offline' ? '' : 'sync-dot--offline'}`} />
          {isOnline && syncTime !== 'Offline' ? `Sync ${syncTime}` : 'Offline'}
        </div>

        {/* Date chip */}
        <span className="date-chip">
          Date: {today}
        </span>

        {/* Notification bell */}
        <button className="notif-btn" onClick={onBellClick} title="Messages">
          Msg
          {unreadCount > 0 && <span className="notif-btn__dot" />}
        </button>

        {/* User name chip */}
        <span className="user-chip">{user.name.split(' ')[0]}</span>
      </div>
    </header>
  );
};

// ══════════════════════════════════════════
// PROGRESS BAR
// ══════════════════════════════════════════
/**
 * ProgressBar
 * Props:
 *   value – 0–100
 *   color – CSS colour string (defaults to --clr-primary)
 */
export const ProgressBar = ({ value, color }) => (
  <div className="progress-bar__track">
    <div
      className="progress-bar__fill"
      style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        background: color || 'var(--clr-primary)',
      }}
    />
  </div>
);

// ══════════════════════════════════════════
// STAT CARD
// ══════════════════════════════════════════
/**
 * StatCard
 * Props:
 *   icon      – emoji string
 *   label     – short label text
 *   value     – main metric value (string or number)
 *   sub       – secondary line (optional)
 *   iconBg    – background colour for the icon box
 */
export const StatCard = ({ icon, label, value, sub, iconBg }) => (
  <div className="stat-card">
    <div className="stat-card__icon" style={{ background: iconBg || 'var(--clr-primary-lt)' }}>
      {icon}
    </div>
    <div className="stat-card__label">{label}</div>
    <div className="stat-card__value">{value}</div>
    {sub && <div className="stat-card__sub">{sub}</div>}
  </div>
);

// ══════════════════════════════════════════
// BADGE
// ══════════════════════════════════════════
/**
 * Badge
 * Props:
 *   variant – 'green' | 'warn' | 'red' | 'blue' | 'muted'
 *   children
 */
export const Badge = ({ variant = 'muted', children, style }) => (
  <span className={`badge badge--${variant}`} style={style}>
    {children}
  </span>
);

// ══════════════════════════════════════════
// ALERT BANNER
// ══════════════════════════════════════════
/**
 * Alert
 * Props:
 *   variant – 'info' | 'warn' | 'danger' | 'success'
 *   icon    – emoji prefix (optional)
 *   children
 *   style   – extra inline styles
 */
export const Alert = ({ variant = 'info', icon, children, style }) => (
  <div className={`alert alert--${variant}`} style={style}>
    {icon && <span>{icon}</span>}
    <span>{children}</span>
  </div>
);

// ══════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════
/**
 * Modal
 * Props:
 *   title    – header string
 *   onClose  – close callback
 *   wide     – boolean, uses modal--wide class
 *   footer   – ReactNode rendered in footer slot
 *   children – modal body content
 */
export const Modal = ({ title, onClose, wide, footer, children }) => (
  <div
    className="modal-overlay"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
  >
    <div
      className={`modal ${wide ? 'modal--wide' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="modal__header">
        <h2>{title}</h2>
        <button className="modal__close" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="modal__body">{children}</div>

      {/* Footer */}
      {footer && <div className="modal__footer">{footer}</div>}
    </div>
  </div>
);

// ══════════════════════════════════════════
// RECOVERY CHART
// ══════════════════════════════════════════
/**
 * RecoveryChart
 * Props:
 *   data       – array of { label, value, color? }
 *   height     – chart height in px (default 80)
 *   color      – default bar colour
 */
export const RecoveryChart = ({ data = [], height = 80, color }) => {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="recovery-chart" style={{ height }}>
      {data.map((item, i) => {
        const h = Math.max(4, (item.value / max) * height);
        return (
          <div
            key={item.label || i}
            className="recovery-bar"
            style={{
              height,
              background: 'transparent',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                height: `${h}px`,
                width: '100%',
                borderRadius: '3px 3px 0 0',
                background: item.color || color || 'var(--clr-primary)',
                opacity: 0.85,
                transition: 'height 0.6s cubic-bezier(.4,0,.2,1)',
                minWidth: 14,
              }}
              title={`${item.label}: ${item.value}`}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--clr-fg)',
                  color: '#fff',
                  fontSize: '.6rem',
                  padding: '2px 5px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  fontWeight: 600,
                }}
              >
                {item.label}: {item.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * RecoverySummary
 * A compact card showing recovery stats with small bar chart.
 */
export const RecoverySummary = ({ sessions = [], progress = 0, streak = 0 }) => {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const daySessions = sessions.filter((s) => s.date === dateStr);
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2),
      value: daySessions.filter((s) => s.completed).length,
      date: dateStr,
    };
  });

  return (
    <div className="card">
      <div className="card__header">
        <span className="card__title">Recovery activity</span>
        <span className="badge badge--green">{streak}-day streak</span>
      </div>
      <div className="card__body">
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <span className="text-muted">Overall progress</span>
          <strong style={{ fontSize: '1.1rem', fontWeight: 800 }}>{progress}%</strong>
        </div>
        <div className="progress-bar__track" style={{ marginBottom: 14 }}>
          <div
            className="progress-bar__fill"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <RecoveryChart data={last7} height={60} />
        <div className="flex-between" style={{ marginTop: 8 }}>
          {last7.map((d) => (
            <span key={d.label} style={{ fontSize: '.6rem', color: 'var(--clr-muted-lt)', fontWeight: 600, textAlign: 'center', flex: 1 }}>
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
// PAGE WRAPPER  (Shell: Sidebar + Topbar + content)
// ══════════════════════════════════════════
/**
 * PageWrapper
 * Combines Sidebar + Topbar + scrollable content area.
 * Props:
 *   user        – current user
 *   page        – active page id
 *   setPage     – page setter
 *   navSections – sidebar nav config
 *   pageTitle   – topbar heading string
 *   unreadCount – bell badge count
 *   onLogout    – logout callback
 *   children    – the actual page component
 */
export const PageWrapper = ({
  user,
  page,
  setPage,
  navSections,
  pageTitle,
  unreadCount,
  onLogout,
  children,
}) => (
  <div className="app-shell">
    <Sidebar
      user={user}
      page={page}
      setPage={setPage}
      navSections={navSections}
      onLogout={onLogout}
    />

    <div className="main-content">
      <Topbar
        title={pageTitle}
        user={user}
        unreadCount={unreadCount}
        onBellClick={() => setPage('messages')}
      />

      {/* Animate page transitions */}
      <div className="page-content" key={page}>
        {children}
      </div>
    </div>
  </div>
);
