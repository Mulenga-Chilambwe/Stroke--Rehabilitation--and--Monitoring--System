/**
 * pages/caregiver/CaregiverVitals.jsx
 * ─────────────────────────────────────────────────────────────
 * Allows the caregiver to record the patient's daily vitals.
 * When saved, the data is written to shared state and becomes
 * immediately visible in the Health Professional's dashboard.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge } from '../../components/shared/UI';

const CaregiverVitals = () => {
  const [state, dispatch] = useStore();
  const { vitals: v } = state;

  // Toggle between view mode and edit (form) mode
  const [editing, setEditing] = useState(false);

  // Local form state initialised from current vitals
  const [form, setForm] = useState({
    heartRate:  v.heartRate,
    bp:         v.bp,
    temp:       v.temp,
    oxygenSat:  v.oxygenSat,
    weight:     v.weight,
  });

  /** Persist the form to the shared store. */
  const saveVitals = () => {
    dispatch((s) => ({
      ...s,
      vitals: {
        ...form,
        heartRate:  Number(form.heartRate),
        temp:       Number(form.temp),
        oxygenSat:  Number(form.oxygenSat),
        weight:     Number(form.weight),
        lastUpdated: 'Just now (caregiver)',
      },
    }));
    setEditing(false);
  };

  /** Helper: determine badge colour based on clinical thresholds. */
  const vitalBadge = (key, val) => {
    const num = Number(val);
    if (key === 'heartRate')  return num > 100 || num < 55 ? 'red' : 'green';
    if (key === 'temp')       return num > 37.5 ? 'warn' : 'green';
    if (key === 'oxygenSat')  return num < 95 ? 'red' : 'green';
    return 'muted';
  };

  return (
    <div>
      {/* ── Banner ── */}
      <Alert variant="info" icon="📏" style={{ marginBottom: 18 }}>
        Record Mercy's vitals daily after morning exercises. Data syncs instantly
        to <strong>Dr. Kumaran's</strong> clinical dashboard.
      </Alert>

      <div className="grid-2 anim-fade-up anim-delay-1">
        {/* Current vitals / edit form */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Current Vitals</span>
            <button
              className="btn btn--outline btn--sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : '✏️ Update Vitals'}
            </button>
          </div>

          <div className="card__body">
            {editing ? (
              /* ── Edit form ── */
              <div className="form-grid">
                {[
                  { label: 'Heart Rate (bpm)', key: 'heartRate', type: 'number' },
                  { label: 'Blood Pressure',   key: 'bp',        type: 'text'   },
                  { label: 'Temperature (°C)', key: 'temp',      type: 'number' },
                  { label: 'Oxygen Sat (%)',   key: 'oxygenSat', type: 'number' },
                  { label: 'Weight (kg)',       key: 'weight',    type: 'number' },
                ].map(({ label, key, type }) => (
                  <div key={key} className="field">
                    <label>{label}</label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}

                <div className="form-grid--full" style={{ gridColumn: '1/-1' }}>
                  <button
                    className="btn btn--primary btn--full"
                    onClick={saveVitals}
                  >
                    💾 Save & Sync to Clinician
                  </button>
                </div>
              </div>
            ) : (
              /* ── Display grid ── */
              <div className="vitals-grid">
                {[
                  { icon: '💓', label: 'Heart Rate',   value: `${v.heartRate} bpm`, key: 'heartRate' },
                  { icon: '🩺', label: 'Blood Pressure', value: v.bp,              key: 'bp' },
                  { icon: '🌡️', label: 'Temperature',  value: `${v.temp} °C`,       key: 'temp' },
                  { icon: '🫀', label: 'O₂ Saturation', value: `${v.oxygenSat}%`,  key: 'oxygenSat' },
                  { icon: '⚖️', label: 'Weight',        value: `${v.weight} kg`,   key: 'weight' },
                  { icon: '🕐', label: 'Last Updated',  value: v.lastUpdated,      key: null },
                ].map(({ icon, label, value, key }) => (
                  <div key={label} className="vital-cell">
                    <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                    <div>
                      <div className="vital-cell__label">{label}</div>
                      <div className="vital-cell__value">{value}</div>
                    </div>
                    {key && (
                      <Badge
                        variant={vitalBadge(key, key === 'bp' ? null : v[key])}
                        style={{ marginLeft: 'auto' }}
                      >
                        ●
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pain log panel */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">😣 Pain Log</span>
          </div>
          <div className="card__body">
            {state.sessions.filter((s) => s.pain > 0).length === 0 ? (
              <p
                className="text-muted text-center"
                style={{ padding: '20px 0' }}
              >
                No pain reported yet ✓
              </p>
            ) : (
              state.sessions
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
                    <span style={{ fontSize: '1.1rem' }}>😣</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {s.exercise}
                      </div>
                      <div className="text-muted">
                        {s.date} · logged by {s.loggedBy || 'unknown'}
                      </div>
                      {s.notes && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            fontStyle: 'italic',
                            marginTop: 2,
                          }}
                        >
                          "{s.notes}"
                        </div>
                      )}
                    </div>
                    <Badge variant={s.pain >= 4 ? 'red' : 'warn'}>
                      {s.pain}/5
                    </Badge>
                  </div>
                ))
            )}

            {/* Report pain button */}
            <div style={{ marginTop: 16 }}>
              <Alert variant="warn" icon="⚠️">
                If Mercy reports severe pain (4–5), contact Dr. Kumaran via
                the Messages tab immediately.
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverVitals;
