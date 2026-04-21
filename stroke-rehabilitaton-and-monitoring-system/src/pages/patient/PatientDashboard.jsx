/**
 * pages/patient/PatientDashboard.jsx
 * ─────────────────────────────────────────────────────────────
 * Home screen for the Patient portal.
 *
 * Fixes applied:
 *   • TODAY is now dynamic (real current date) instead of hardcoded
 *   • markComplete creates a NEW session if one doesn't exist yet
 *   • shared.css imported here to guarantee styles are loaded
 * ─────────────────────────────────────────────────────────────
 */

import React from 'react';
import { useStore } from '../../context/StoreContext';
import { StatCard, ProgressBar, Alert, Badge } from '../../components/shared/UI';
import '../../styles/shared.css';

// Always use the real current date so exercise sessions match
const TODAY = new Date().toISOString().split('T')[0]; // e.g. "2025-04-20"

const PatientDashboard = ({ setPage }) => {
  const [state, dispatch] = useStore();
  const { patientProfile: p, exercisePlan, nextSession } = state;

  // Daily exercises from the plan
  const dailyExercises = exercisePlan.filter((e) => e.freq === 'Daily');

  // Count how many are done today
  const doneToday = state.sessions.filter(
    (s) => s.date === TODAY && s.completed
  ).length;

  /**
   * Mark an exercise as completed.
   * If a session record for today exists → update it.
   * If not → create a new one so it always works regardless of date.
   */
  const markComplete = (exerciseName) => {
    const exists = state.sessions.find(
      (s) => s.exercise === exerciseName && s.date === TODAY
    );

    dispatch((s) => ({
      ...s,
      sessions: exists
        ? s.sessions.map((sess) =>
            sess.exercise === exerciseName && sess.date === TODAY
              ? { ...sess, completed: true, loggedBy: 'patient' }
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
              loggedBy: 'patient',
            },
          ],
    }));
  };

  return (
    <div>
      {/* ── Welcome banner ── */}
      <div
        className="anim-fade-up anim-delay-1"
        style={{
          background:
            'linear-gradient(125deg, var(--clr-primary) 0%, var(--clr-primary-dk) 100%)',
          borderRadius: 'var(--radius)',
          padding: '22px 28px',
          marginBottom: 20,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 4 }}>
            Good morning 👋
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.55rem',
              marginBottom: 6,
            }}
          >
            Welcome back, {p.name.split(' ')[0]}!
          </h2>
          <p style={{ fontSize: '0.88rem', opacity: 0.8 }}>
            You're on a <strong>{p.streak}-day streak</strong> 🔥 Keep it up!
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.2rem',
              lineHeight: 1,
            }}
          >
            {p.progress}%
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.65 }}>
            Overall recovery
          </div>
        </div>
      </div>

      {/* ── KPI stat cards ── */}
      <div
        className="grid-4 anim-fade-up anim-delay-2"
        style={{ marginBottom: 20 }}
      >
        <StatCard
          icon="✅"
          label="Today's Progress"
          value={`${doneToday}/${dailyExercises.length}`}
          sub="sessions completed"
          iconBg="#e6f9f0"
        />
        <StatCard
          icon="📅"
          label="Total Sessions"
          value={p.totalSessions}
          sub={`of ${p.targetSessions} target`}
          iconBg="var(--clr-primary-lt)"
        />
        <StatCard
          icon="🔥"
          label="Day Streak"
          value={p.streak}
          sub="consecutive days"
          iconBg="#fff5e6"
        />
        <StatCard
          icon="💪"
          label="Exercises Assigned"
          value={exercisePlan.length}
          sub="in active plan"
          iconBg="var(--clr-primary-lt)"
        />
      </div>

      {/* ── Two-column section ── */}
      <div className="grid-2 anim-fade-up anim-delay-3">
        {/* Today's exercise checklist */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">📋 Today's Exercises</span>
            <button
              className="btn btn--outline btn--sm"
              onClick={() => setPage('exercises')}
            >
              View All
            </button>
          </div>
          <div
            className="card__body"
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {dailyExercises.length === 0 && (
              <p className="text-muted text-center" style={{ padding: '16px 0' }}>
                No daily exercises assigned yet.
              </p>
            )}

            {dailyExercises.map((ex) => {
              const session = state.sessions.find(
                (s) => s.exercise === ex.name && s.date === TODAY
              );
              const done = session?.completed || false;

              return (
                <div
                  key={ex.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: done
                      ? 'var(--clr-primary-lt)'
                      : 'var(--clr-bg)',
                    border: '1px solid var(--clr-border)',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{ex.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>
                      {ex.name}
                    </div>
                    <div className="text-muted">{ex.sets}</div>
                  </div>
                  {done ? (
                    <Badge variant="green">✓ Done</Badge>
                  ) : (
                    <button
                      className="btn btn--primary btn--xs"
                      onClick={() => markComplete(ex.name)}
                    >
                      Start
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: progress + streak + next session */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recovery progress */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">📈 Recovery Progress</span>
            </div>
            <div className="card__body">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <span className="text-muted">Overall recovery</span>
                <strong style={{ color: 'var(--clr-primary)' }}>
                  {p.progress}%
                </strong>
              </div>
              <ProgressBar value={p.progress} />

              <div className="divider" />

              {/* Weekly streak dots */}
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  marginBottom: 8,
                }}
              >
                This Week
              </div>
              <div className="streak-days">
                {['M', 'T', 'W', 'T', 'F', 'Sa', 'Su'].map((d, i) => (
                  <div
                    key={i}
                    className={`streak-day ${
                      i < p.streak
                        ? 'streak-day--done'
                        : i === p.streak
                        ? 'streak-day--today'
                        : 'streak-day--miss'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <p className="text-muted" style={{ marginTop: 8 }}>
                {p.streak} of 7 days completed
              </p>
            </div>
          </div>

          {/* Next session reminder */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">⏰ Next Session</span>
            </div>
            <div className="card__body">
              <Alert variant="info" icon="🗓️">
                <strong>{nextSession.date}</strong>
                <br />
                {nextSession.exercise}
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
