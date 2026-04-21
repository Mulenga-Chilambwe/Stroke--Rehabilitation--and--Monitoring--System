/**
 * pages/healthpro/HPPages.jsx
 * ─────────────────────────────────────────────────────────────
 * All Health-Professional page components live here.
 * They are named exports so HPPortal.jsx can import selectively.
 *
 * Exports:
 *   HPDashboard    – clinical overview (vitals, sessions, alerts)
 *   HPExercisePlan – assign / remove exercises; syncs to all portals
 *   HPReports      – full session table + vitals summary
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StatCard, ProgressBar, Alert, Badge, Modal } from '../../components/shared/UI';

/* ── Helpers ─────────────────────────────────────────────── */

/** Map exercise difficulty to a badge colour variant. */
const diffBadge = (d) =>
  d === 'easy' ? 'green' : d === 'med' ? 'warn' : 'red';


// ══════════════════════════════════════════════════════════════
// HP DASHBOARD
// ══════════════════════════════════════════════════════════════
/**
 * HPDashboard
 * ─────────────────────────────────────────────────────────────
 * Clinical overview for the Health Professional.
 *
 * Shows:
 *   • 4 KPI stat cards
 *   • Patient summary card with vitals (synced from caregiver)
 *   • Recent session list
 *   • System alerts
 * ─────────────────────────────────────────────────────────────
 */
const HPDashboard = () => {
  const [state] = useStore();
  const { patientProfile: p, vitals: v, sessions, alerts, messages } = state;

  const completedSessions = sessions.filter((s) => s.completed).length;
  const unreadMessages    = messages.filter((m) => !m.read && m.to === 'hp').length;
  const unreadAlerts      = alerts.filter((a) => !a.read).length;

  return (
    <div>
      {/* ── KPI cards ── */}
      <div className="grid-4 anim-fade-up anim-delay-1" style={{ marginBottom: 20 }}>
        <StatCard
          icon="📈"
          label="Recovery Progress"
          value={`${p.progress}%`}
          sub="overall"
          iconBg="var(--clr-primary-lt)"
        />
        <StatCard
          icon="✅"
          label="Sessions Done"
          value={`${completedSessions}/${sessions.length}`}
          sub="all time"
          iconBg="#e6f9f0"
        />
        <StatCard
          icon="💬"
          label="Unread Messages"
          value={unreadMessages}
          sub="pending review"
          iconBg="#fff5e6"
        />
        <StatCard
          icon="⚠️"
          label="Active Alerts"
          value={unreadAlerts}
          sub="require action"
          iconBg="#fdeaea"
        />
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        {/* ── Patient overview card ── */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Patient: {p.name}</span>
            <Badge variant="green">Active</Badge>
          </div>
          <div className="card__body">
            {/* Avatar + basic info */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'var(--clr-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', color: '#fff', fontWeight: 700, flexShrink: 0,
                }}
              >
                MB
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  {p.name}
                </div>
                <div className="text-muted">{p.condition} · {p.age} yrs old</div>
                <div className="text-muted">Admitted: {p.admitDate}</div>
              </div>
            </div>

            {/* Recovery bar */}
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <span className="text-muted">Recovery</span>
              <strong style={{ color: 'var(--clr-primary)' }}>{p.progress}%</strong>
            </div>
            <ProgressBar value={p.progress} />

            <div className="divider" />

            {/* Vitals (synced from caregiver) */}
            <div style={{ fontWeight: 600, fontSize: '0.86rem', marginBottom: 10 }}>
              Latest Vitals{' '}
              <span className="text-muted" style={{ fontWeight: 400 }}>
                · updated {v.lastUpdated}
              </span>
            </div>
            <div className="vitals-grid">
              {[
                { icon: '💓', label: 'Heart Rate',    value: `${v.heartRate} bpm` },
                { icon: '🩺', label: 'Blood Pressure', value: v.bp },
                { icon: '🌡️', label: 'Temperature',   value: `${v.temp} °C` },
                { icon: '🫀', label: 'O₂ Saturation', value: `${v.oxygenSat}%` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="vital-cell">
                  <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                  <div>
                    <div className="vital-cell__label">{label}</div>
                    <div className="vital-cell__value">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column: recent sessions + alerts ── */}
        <div className="card-stack">
          {/* Recent sessions */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">Recent Sessions</span>
            </div>
            <div className="card__body">
              {[...sessions].reverse().slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex', gap: 10, padding: '9px 0',
                    borderBottom: '1px solid var(--clr-border)',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>
                    {s.completed ? '✅' : '❌'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                      {s.exercise}
                    </div>
                    <div className="text-muted">
                      {s.date} · {s.duration} min
                      {s.loggedBy && ` · by ${s.loggedBy}`}
                    </div>
                  </div>
                  {s.pain > 0 && (
                    <Badge variant={s.pain >= 4 ? 'red' : 'warn'}>
                      Pain {s.pain}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* System alerts */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">⚠ System Alerts</span>
              <Badge variant="red">{unreadAlerts}</Badge>
            </div>
            <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alerts.map((a) => (
                <Alert
                  key={a.id}
                  variant={a.type === 'warning' ? 'warn' : 'info'}
                  icon={a.type === 'warning' ? '⚠️' : 'ℹ️'}
                  style={{ marginBottom: 0 }}
                >
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


// ══════════════════════════════════════════════════════════════
// HP EXERCISE PLAN
// ══════════════════════════════════════════════════════════════
/**
 * HPExercisePlan
 * ─────────────────────────────────────────────────────────────
 * Lets the health professional assign new exercises to the
 * patient and remove existing ones.
 *
 * Every change dispatches to the shared store and is therefore
 * immediately visible in the Patient and Caregiver portals.
 * ─────────────────────────────────────────────────────────────
 */
const HPExercisePlan = () => {
  const [state, dispatch] = useStore();
  const { exercisePlan } = state;

  /* Controls the "Assign Exercise" modal */
  const [showAdd, setShowAdd] = useState(false);

  /* Controlled form state for the new exercise */
  const [form, setForm] = useState({
    name: '',
    emoji: '💪',
    sets: '',
    freq: 'Daily',
    category: 'Upper Limb',
    difficulty: 'easy',
    description: '',
  });

  /** Update a single form field. */
  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /**
   * Add the new exercise to the shared plan.
   * The patient and caregiver portals will show it immediately.
   */
  const addExercise = () => {
    if (!form.name.trim()) return;

    dispatch((s) => ({
      ...s,
      exercisePlan: [
        ...s.exercisePlan,
        { ...form, id: `e${Date.now()}`, assignedBy: 'Dr. Kumaran' },
      ],
    }));

    // Reset form and close modal
    setForm({
      name: '', emoji: '💪', sets: '', freq: 'Daily',
      category: 'Upper Limb', difficulty: 'easy', description: '',
    });
    setShowAdd(false);
  };

  /**
   * Remove an exercise from the shared plan.
   * Also visible immediately in patient / caregiver portals.
   */
  const removeExercise = (id) => {
    dispatch((s) => ({
      ...s,
      exercisePlan: s.exercisePlan.filter((e) => e.id !== id),
    }));
  };

  return (
    <div>
      {/* ── Assign modal ── */}
      {showAdd && (
        <Modal
          title="Assign New Exercise"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button
                className="btn btn--outline"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button className="btn btn--primary" onClick={addExercise}>
                ✓ Assign to Patient
              </button>
            </>
          }
        >
          <div className="form-grid">
            {/* Exercise name */}
            <div className="field form-grid--full">
              <label>Exercise Name</label>
              <input
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="e.g. Wrist Flexion"
              />
            </div>

            {/* Emoji + sets */}
            <div className="field">
              <label>Emoji Icon</label>
              <input
                value={form.emoji}
                onChange={(e) => setField('emoji', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Sets / Reps</label>
              <input
                value={form.sets}
                onChange={(e) => setField('sets', e.target.value)}
                placeholder="e.g. 3 × 10"
              />
            </div>

            {/* Frequency */}
            <div className="field">
              <label>Frequency</label>
              <select
                value={form.freq}
                onChange={(e) => setField('freq', e.target.value)}
              >
                {['Daily', '3x / week', '2x / week', 'Weekly'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="field">
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
              >
                {['Upper Limb', 'Lower Limb', 'Balance', 'Speech', 'Cognitive'].map(
                  (o) => <option key={o}>{o}</option>
                )}
              </select>
            </div>

            {/* Difficulty */}
            <div className="field">
              <label>Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setField('difficulty', e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="med">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Instructions */}
            <div className="field form-grid--full">
              <label>Patient Instructions</label>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Describe how the patient should perform this exercise…"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── Header row: info alert + add button ── */}
      <div
        className="flex-between anim-fade-up anim-delay-1"
        style={{ marginBottom: 18 }}
      >
        <Alert
          variant="info"
          icon="📋"
          style={{ margin: 0, flex: 1, marginRight: 14 }}
        >
          Changes to the exercise plan sync <strong>instantly</strong> to the
          patient and caregiver portals.
        </Alert>
        <button
          className="btn btn--primary"
          onClick={() => setShowAdd(true)}
        >
          + Assign Exercise
        </button>
      </div>

      {/* ── Exercise list ── */}
      <div
        className="anim-fade-up anim-delay-2"
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {exercisePlan.map((ex) => (
          <div
            key={ex.id}
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>{ex.emoji}</span>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {ex.name}
              </div>
              <div className="text-muted">
                {ex.category} · {ex.sets} · {ex.freq} · Assigned by{' '}
                {ex.assignedBy}
              </div>
              {ex.description && (
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--clr-fg)',
                    marginTop: 4,
                    fontStyle: 'italic',
                  }}
                >
                  {ex.description}
                </div>
              )}
            </div>

            <Badge variant={diffBadge(ex.difficulty)}>{ex.difficulty}</Badge>

            <button
              className="btn btn--outline btn--xs"
              style={{ color: 'var(--clr-danger)', borderColor: '#fcc' }}
              onClick={() => removeExercise(ex.id)}
            >
              Remove
            </button>
          </div>
        ))}

        {exercisePlan.length === 0 && (
          <div
            className="text-center text-muted"
            style={{ padding: '30px 0' }}
          >
            No exercises assigned yet. Click "+ Assign Exercise" to add one.
          </div>
        )}
      </div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════
// HP REPORTS
// ══════════════════════════════════════════════════════════════
/**
 * HPReports
 * ─────────────────────────────────────────────────────────────
 * Full session-log table, vitals summary, and clinical notes.
 * Read-only view — data is pushed here by patient and caregiver.
 * ─────────────────────────────────────────────────────────────
 */
const HPReports = () => {
  const [state] = useStore();
  const { sessions, vitals: v, patientProfile: p } = state;

  const completedCount = sessions.filter((s) => s.completed).length;

  return (
    <div>
      <div className="grid-2 anim-fade-up anim-delay-1">
        {/* ── Full session table ── */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Full Session Log</span>
            <button className="btn btn--outline btn--sm">📄 Export</button>
          </div>
          <div className="card__body" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Date', 'Exercise', 'Duration', 'Status', 'Pain', 'Logged By'].map(
                    (h) => <th key={h}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td style={{ fontWeight: 600 }}>{s.exercise}</td>
                    <td>{s.duration} min</td>
                    <td>
                      <Badge variant={s.completed ? 'green' : 'red'}>
                        {s.completed ? 'Done' : 'Missed'}
                      </Badge>
                    </td>
                    <td>
                      {s.pain > 0 ? (
                        <Badge variant={s.pain >= 4 ? 'red' : 'warn'}>
                          {s.pain}/5
                        </Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {s.loggedBy || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="card-stack">
          {/* Vitals summary */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">Vitals Summary</span>
              <span className="text-muted" style={{ fontSize: '0.73rem' }}>
                {v.lastUpdated}
              </span>
            </div>
            <div className="card__body">
              {[
                ['💓 Heart Rate',      `${v.heartRate} bpm`],
                ['🩺 Blood Pressure',  v.bp],
                ['🌡️ Temperature',    `${v.temp} °C`],
                ['🫀 O₂ Saturation',  `${v.oxygenSat}%`],
                ['⚖️ Weight',          `${v.weight} kg`],
              ].map(([k, val]) => (
                <div
                  key={k}
                  className="flex-between"
                  style={{
                    padding: '7px 0',
                    borderBottom: '1px solid var(--clr-border)',
                    fontSize: '0.84rem',
                  }}
                >
                  <span className="text-muted">{k}</span>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical summary card */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">Clinical Summary</span>
            </div>
            <div className="card__body">
              {/* Recovery progress */}
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span className="text-muted">Overall recovery</span>
                <strong style={{ color: 'var(--clr-primary)' }}>
                  {p.progress}%
                </strong>
              </div>
              <ProgressBar value={p.progress} />

              {/* Quick stats */}
              <div className="divider" />
              {[
                ['Sessions completed', `${completedCount} / ${p.targetSessions}`],
                ['Active streak',      `${p.streak} days`],
                ['Condition',          p.condition],
                ['Age',                `${p.age} years`],
              ].map(([k, val]) => (
                <div
                  key={k}
                  className="flex-between"
                  style={{
                    padding: '6px 0',
                    borderBottom: '1px solid var(--clr-border)',
                    fontSize: '0.84rem',
                  }}
                >
                  <span className="text-muted">{k}</span>
                  <strong>{val}</strong>
                </div>
              ))}

              {/* Free-text clinical note */}
              <div
                style={{
                  marginTop: 14,
                  fontSize: '0.84rem',
                  lineHeight: 1.7,
                  color: 'var(--clr-fg)',
                  background: 'var(--clr-bg)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                }}
              >
                Patient shows <strong>consistent improvement</strong>. Sessions
                completed: {completedCount}/{sessions.length}. Pain levels remain
                low. Recommend progressing to{' '}
                <strong>balance exercises</strong> at the next review.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ── Named exports ─────────────────────────────────────────────
export { HPDashboard, HPExercisePlan, HPReports };
