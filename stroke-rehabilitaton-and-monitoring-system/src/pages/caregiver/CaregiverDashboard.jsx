/**
 * pages/caregiver/CaregiverDashboard.jsx
 * ─────────────────────────────────────────────────────────────
 * Home screen for the Caregiver portal.
 * Fix: dynamic TODAY date + creates sessions on the fly.
 * ─────────────────────────────────────────────────────────────
 */

import React from 'react';
import { useStore } from '../../context/StoreContext';
import { StatCard, ProgressBar, Alert, Badge } from '../../components/shared/UI';

const TODAY = new Date().toISOString().split('T')[0];

const CaregiverDashboard = () => {
  const [state, dispatch] = useStore();
  const { patientProfile: p, exercisePlan, alerts } = state;

  const dailyDoneCount = state.sessions.filter(
    (s) => s.date === TODAY && s.completed
  ).length;

  const markDone = (exerciseName) => {
    const exists = state.sessions.find(
      (s) => s.exercise === exerciseName && s.date === TODAY
    );

    dispatch((s) => ({
      ...s,
      sessions: exists
        ? s.sessions.map((sess) =>
            sess.exercise === exerciseName && sess.date === TODAY && !sess.completed
              ? { ...sess, completed: true, loggedBy: 'caregiver' }
              : sess
          )
        : [
            ...s.sessions,
            {
              id: `s${Date.now()}`,
              date: TODAY,
              exercise: exerciseName,
              duration: 20,
              completed: true,
              pain: 0,
              notes: '',
              loggedBy: 'caregiver',
            },
          ],
    }));
  };

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <div>
      <Alert variant="info" icon="👋" style={{ marginBottom: 18 }}>
        You are monitoring <strong>{p.name}</strong>. Use this portal to track
        exercises, log vitals, and communicate with Dr. Kumaran.
      </Alert>

      <div className="grid-4 anim-fade-up anim-delay-1" style={{ marginBottom: 20 }}>
        <StatCard icon="📈" label="Recovery Progress" value={`${p.progress}%`} sub="overall" iconBg="var(--clr-primary-lt)" />
        <StatCard icon="✅" label="Sessions Today" value={dailyDoneCount} sub={`of ${exercisePlan.filter((e) => e.freq === 'Daily').length} daily`} iconBg="#e6f9f0" />
        <StatCard icon="🔥" label="Day Streak" value={p.streak} sub="consecutive days" iconBg="#fff5e6" />
        <StatCard icon="⚠️" label="Active Alerts" value={unreadAlerts} sub="need attention" iconBg="#fdeaea" />
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        {/* Exercise checklist */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">📋 Today's Exercise Checklist</span>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {exercisePlan.map((ex) => {
              const session = state.sessions.find(
                (s) => s.exercise === ex.name && s.date === TODAY
              );
              const done = session?.completed || false;

              return (
                <div
                  key={ex.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 'var(--radius-sm)',
                    background: done ? 'var(--clr-primary-lt)' : 'var(--clr-bg)',
                    border: '1px solid var(--clr-border)',
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{ex.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{ex.name}</div>
                    <div className="text-muted">{ex.sets} · {ex.freq}</div>
                  </div>
                  {done ? (
                    <div style={{ textAlign: 'right' }}>
                      <Badge variant="green">✓ Done</Badge>
                      {session?.loggedBy && (
                        <div className="text-muted" style={{ marginTop: 2, fontSize: '0.7rem' }}>
                          by {session.loggedBy}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button className="btn btn--accent btn--xs" onClick={() => markDone(ex.name)}>
                      Mark Done
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card__header">
              <span className="card__title">📈 {p.name}'s Recovery</span>
            </div>
            <div className="card__body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-muted">Overall progress</span>
                <strong style={{ color: 'var(--clr-primary)' }}>{p.progress}%</strong>
              </div>
              <ProgressBar value={p.progress} />
              <div className="divider" />
              <div className="timeline">
                {[
                  { emoji: '🏥', title: 'Admitted to hospital',   sub: 'Kitwe Central · Jan 8, 2025' },
                  { emoji: '🚪', title: 'Discharged to home',     sub: 'Jan 18, 2025' },
                  { emoji: '💪', title: 'Rehabilitation started', sub: 'Jan 20, 2025' },
                  { emoji: '🎯', title: `Session ${p.totalSessions}/${p.targetSessions}`, sub: 'Active' },
                ].map((tl, i) => (
                  <div key={i} className="timeline__item">
                    <div className="timeline__dot">{tl.emoji}</div>
                    <div className="timeline__body">
                      <div className="timeline__title">{tl.title}</div>
                      <div className="timeline__sub">{tl.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <span className="card__title">⚠ Alerts</span>
              <Badge variant="red">{unreadAlerts}</Badge>
            </div>
            <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alerts.map((a) => (
                <Alert key={a.id} variant={a.type === 'warning' ? 'warn' : 'info'}
                  icon={a.type === 'warning' ? '⚠️' : 'ℹ️'} style={{ marginBottom: 0 }}>
                  {a.msg}
                </Alert>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
