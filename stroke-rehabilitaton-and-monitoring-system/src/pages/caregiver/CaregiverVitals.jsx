/**
 * pages/caregiver/CaregiverVitals.jsx
 * ─────────────────────────────────────────────────────────────
 * Vital-signs logging page for caregivers — form for heart rate,
 * blood pressure, temperature, oxygen saturation, weight, sleep,
 * and mood. Saves to local state and syncs to the backend.
 * Generates alerts when vitals fall outside safe ranges.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge } from '../../components/shared/UI';
import { getDoctorForPatient, getPatient, getPatientIdForUser, todayKey } from '../../utils/care';

const CaregiverVitals = () => {
  const { currentUser } = useAuth();
  const [state, dispatch, ctx] = useStore();
  const patientId = getPatientIdForUser(currentUser);
  const patient = getPatient(state, patientId);
  const doctor = getDoctorForPatient(state, patientId);
  const vitals = state.vitals[patientId];
  const [form, setForm] = useState({
    heartRate: vitals?.heartRate || 72,
    bp: vitals?.bp || '120/80',
    temp: vitals?.temp || 36.6,
    oxygenSat: vitals?.oxygenSat || 98,
    weight: vitals?.weight || 68,
    mood: vitals?.mood || 'Steady',
    sleep: vitals?.sleep || 7,
  });

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveVitals = () => {
    const clean = {
      ...form,
      heartRate: Number(form.heartRate),
      temp: Number(form.temp),
      oxygenSat: Number(form.oxygenSat),
      weight: Number(form.weight),
      sleep: Number(form.sleep),
      lastUpdated: 'Just now',
      loggedBy: currentUser.name,
    };

    ctx.syncVital({ ...clean, patientId, date: todayKey() });

    dispatch((s) => ({
      ...s,
      vitals: { ...s.vitals, [patientId]: clean },
      vitalHistory: [
        ...s.vitalHistory,
        {
          id: `v${Date.now()}`,
          patientId,
          date: todayKey(),
          bp: clean.bp,
          heartRate: clean.heartRate,
          oxygenSat: clean.oxygenSat,
          temp: clean.temp,
          mood: clean.mood,
          loggedBy: currentUser.name,
        },
      ],
      alerts:
        clean.oxygenSat < 95 || clean.heartRate > 105
          ? [
              ...s.alerts,
              {
                id: `a${Date.now()}`,
                patientId,
                type: 'warning',
                msg: `${patient.name} has vitals outside the safe review range. Clinician should review.`,
                time: 'Just now',
                read: false,
              },
            ]
          : s.alerts,
    }));
  };

  const history = state.vitalHistory.filter((entry) => entry.patientId === patientId).slice(-6).reverse();

  return (
    <div>
      <Alert variant="info" icon="Vitals" style={{ marginBottom: 18 }}>
        Vitals logged here become visible immediately to <strong>{doctor.name}</strong> for {patient.name}'s case.
      </Alert>

      <div className="grid-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">New vitals entry</span>
            <Badge variant="blue">Live sync</Badge>
          </div>
          <div className="card__body form-grid">
            {[
              ['heartRate', 'Heart rate (bpm)', 'number'],
              ['bp', 'Blood pressure', 'text'],
              ['temp', 'Temperature (C)', 'number'],
              ['oxygenSat', 'Oxygen saturation (%)', 'number'],
              ['weight', 'Weight (kg)', 'number'],
              ['sleep', 'Sleep (hours)', 'number'],
            ].map(([key, label, type]) => (
              <div key={key} className="field">
                <label>{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setField(key, e.target.value)} />
              </div>
            ))}
            <div className="field form-grid--full">
              <label>Mood / wellbeing</label>
              <select value={form.mood} onChange={(e) => setField('mood', e.target.value)}>
                {['Positive', 'Steady', 'Tired', 'Anxious', 'Painful'].map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <button className="btn btn--primary btn--full form-grid--full" onClick={saveVitals}>Save and sync to doctor</button>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <span className="card__title">Recent vitals history</span>
            <Badge variant="green">{history.length} records</Badge>
          </div>
          <div className="card__body stack-list">
            {history.map((entry) => (
              <div key={entry.id} className="care-row">
                <div style={{ flex: 1 }}>
                  <strong>{entry.date}</strong>
                  <span>BP {entry.bp} · HR {entry.heartRate} · O2 {entry.oxygenSat}% · {entry.mood}</span>
                </div>
                <Badge variant={entry.oxygenSat < 95 ? 'red' : 'green'}>{entry.loggedBy}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverVitals;
