/**
 * pages/patient/PatientExercises.jsx
 * ─────────────────────────────────────────────────────────────
 * Displays the patient's assigned exercise plan as a grid.
 * Tapping a card opens a modal with instructions and a
 * pain-level selector, then logs the session to shared state.
 *
 * Fix: uses dynamic TODAY date and creates sessions on the fly.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, Modal } from '../../components/shared/UI';

// Dynamic date — always today
const TODAY = new Date().toISOString().split('T')[0];

const diffBadge = (d) =>
  d === 'easy' ? 'green' : d === 'med' ? 'warn' : 'red';

const diffBg = (d) =>
  d === 'easy' ? '#e6f9f0' : d === 'med' ? '#fff5e6' : '#fdeaea';

const PatientExercises = () => {
  const [state, dispatch] = useStore();
  const { exercisePlan } = state;

  const [selected, setSelected] = useState(null);
  const [pain, setPain] = useState(0);

  const categories = ['All', ...new Set(exercisePlan.map((e) => e.category))];
  const [filter, setFilter] = useState('All');

  const filtered =
    filter === 'All'
      ? exercisePlan
      : exercisePlan.filter((e) => e.category === filter);

  /**
   * Log a completed session.
   * Creates a new session record if one doesn't exist for today,
   * or updates the existing one.
   */
  const logSession = () => {
    const exists = state.sessions.find(
      (s) => s.exercise === selected.name && s.date === TODAY
    );

    dispatch((s) => ({
      ...s,
      sessions: exists
        ? s.sessions.map((sess) =>
            sess.exercise === selected.name && sess.date === TODAY
              ? { ...sess, completed: true, pain, loggedBy: 'patient' }
              : sess
          )
        : [
            ...s.sessions,
            {
              id: `s${Date.now()}`,
              date: TODAY,
              exercise: selected.name,
              duration: 20,
              completed: true,
              pain,
              notes: '',
              loggedBy: 'patient',
            },
          ],
    }));

    setSelected(null);
    setPain(0);
  };

  return (
    <div>
      <Alert variant="info" icon="💡" style={{ marginBottom: 18 }}>
        Your exercise plan is assigned by <strong>Dr. Kumaran</strong>. Tap any
        exercise for full instructions and to log your session.
      </Alert>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn btn--sm ${filter === cat ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise grid */}
      <div className="grid-3">
        {filtered.map((ex) => {
          const done = state.sessions.some(
            (s) => s.exercise === ex.name && s.date === TODAY && s.completed
          );

          return (
            <div
              key={ex.id}
              className="exercise-card"
              onClick={() => { setSelected(ex); setPain(0); }}
            >
              <div
                className="exercise-card__thumb"
                style={{ background: diffBg(ex.difficulty) }}
              >
                {ex.emoji}
              </div>
              <div className="exercise-card__body">
                <div className="exercise-card__name">{ex.name}</div>
                <div className="exercise-card__meta">
                  {ex.category} · {ex.sets} · {ex.freq}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge variant={diffBadge(ex.difficulty)}>
                    {ex.difficulty === 'easy' ? 'Easy' : ex.difficulty === 'med' ? 'Medium' : 'Hard'}
                  </Badge>
                  {done && <Badge variant="green">✓ Done today</Badge>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise detail modal */}
      {selected && (
        <Modal
          title={`${selected.emoji} ${selected.name}`}
          onClose={() => setSelected(null)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setSelected(null)}>
                Close
              </button>
              <button className="btn btn--primary" onClick={logSession}>
                ✓ Mark as Complete
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <Badge variant="muted">{selected.category}</Badge>
            <Badge variant="blue">{selected.sets}</Badge>
            <Badge variant="muted">📅 {selected.freq}</Badge>
            <Badge variant={diffBadge(selected.difficulty)}>{selected.difficulty}</Badge>
          </div>

          <p style={{ fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 18 }}>
            {selected.description || 'Perform this exercise slowly and with control.'}
          </p>

          <Alert variant="warn" icon="⚠️" style={{ marginBottom: 18 }}>
            Always have your caregiver nearby. Stop immediately if you feel sharp
            pain or dizziness.
          </Alert>

          <div style={{ fontWeight: 600, fontSize: '0.86rem', marginBottom: 8 }}>
            Rate your pain level (0 = none, 5 = severe)
          </div>
          <div className="pain-scale">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`pain-btn ${pain === n ? 'selected' : ''}`}
                onClick={() => setPain(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientExercises;
