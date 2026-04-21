/**
 * pages/patient/PatientProgress.jsx
 * ─────────────────────────────────────────────────────────────
 * Shows the patient their session history, overall recovery
 * progress, and a summary of pain reports.
 * ─────────────────────────────────────────────────────────────
 */

import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProgressBar, Badge } from '../../components/shared/UI';

const PatientProgress = () => {
  const [state] = useStore();
  const { sessions, patientProfile: p } = state;

  const completed = sessions.filter((s) => s.completed).length;
  const total     = sessions.length;

  return (
    <div>
      <div className="grid-2 anim-fade-up anim-delay-1">
        {/* ── Session history ── */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">📋 Session History</span>
            <Badge variant="muted">{completed}/{total} completed</Badge>
          </div>
          <div className="card__body">
            {sessions.length === 0 && (
              <p className="text-muted text-center" style={{ padding: '20px 0' }}>
                No sessions logged yet.
              </p>
            )}

            {sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '11px 0',
                  borderBottom: '1px solid var(--clr-border)',
                  alignItems: 'flex-start',
                }}
              >
                {/* Status icon */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: s.completed ? 'var(--clr-primary-lt)' : '#fdeaea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {s.completed ? '✅' : '❌'}
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>
                    {s.exercise}
                  </div>
                  <div className="text-muted">
                    {s.date} · {s.duration} min
                    {s.loggedBy && ` · logged by ${s.loggedBy}`}
                  </div>
                  {s.notes && (
                    <div
                      style={{
                        fontSize: '0.78rem',
                        fontStyle: 'italic',
                        color: 'var(--clr-fg)',
                        marginTop: 3,
                      }}
                    >
                      "{s.notes}"
                    </div>
                  )}
                </div>

                {/* Pain badge */}
                {s.pain > 0 && (
                  <Badge variant={s.pain >= 4 ? 'red' : 'warn'}>
                    Pain {s.pain}/5
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="card-stack">
          {/* Overall progress */}
          <div className="card anim-fade-up anim-delay-2">
            <div className="card__header">
              <span className="card__title">📈 My Progress</span>
            </div>
            <div className="card__body">
              {/* Big percentage */}
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '3.5rem',
                  color: 'var(--clr-primary)',
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {p.progress}%
              </div>
              <div className="text-muted text-center mb-4">
                Overall recovery
              </div>
              <ProgressBar value={p.progress} />

              <div className="divider" />

              {/* Quick stats */}
              {[
                ['Sessions completed', `${completed} / ${p.targetSessions}`],
                ['Active streak',      `${p.streak} days`],
                ['Rehabilitation start', 'Jan 20, 2025'],
                ['Assigned clinician', 'Dr. Kumaran'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--clr-border)',
                    fontSize: '0.84rem',
                  }}
                >
                  <span className="text-muted">{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Pain summary */}
          <div className="card anim-fade-up anim-delay-3">
            <div className="card__header">
              <span className="card__title">😣 Pain Reports</span>
            </div>
            <div className="card__body">
              {sessions.filter((s) => s.pain > 0).length === 0 ? (
                <p
                  className="text-muted text-center"
                  style={{ padding: '14px 0' }}
                >
                  No pain reported ✓
                </p>
              ) : (
                sessions
                  .filter((s) => s.pain > 0)
                  .map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '9px 0',
                        borderBottom: '1px solid var(--clr-border)',
                        alignItems: 'center',
                      }}
                    >
                      <span>😣</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {s.exercise}
                        </div>
                        <div className="text-muted">{s.date}</div>
                      </div>
                      <Badge variant={s.pain >= 4 ? 'red' : 'warn'}>
                        {s.pain}/5
                      </Badge>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProgress;
