import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge } from '../../components/shared/UI';
import RecoveryInsights from '../../components/shared/RecoveryInsights';
import { getDoctorForPatient, getCaregiverForPatient, getPatient, getPatientIdForUser, todayKey } from '../../utils/care';

const PatientVitals = () => {
  const { currentUser } = useAuth();
  const [state, dispatch, ctx] = useStore();
  const patientId = getPatientIdForUser(currentUser);
  const patient = getPatient(state, patientId);
  const doctor = getDoctorForPatient(state, patientId);
  const caregiver = getCaregiverForPatient(state, patientId);
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
  const [saved, setSaved] = useState(false);

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
                msg: `${patient.name} has vitals outside the safe range. Clinician should review.`,
                time: 'Just now',
                read: false,
              },
            ]
          : s.alerts,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const history = state.vitalHistory.filter((entry) => entry.patientId === patientId).slice(-8).reverse();

  return (
    <div>
      <Alert variant="info" icon="Vitals" style={{ marginBottom: 18 }}>
        Your vitals are shared in real-time with <strong>{doctor.name}</strong> and your caregiver <strong>{caregiver.name}</strong>. Regular tracking helps monitor your recovery progress.
      </Alert>

      {saved && (
        <Alert variant="success" icon="OK" style={{ marginBottom: 18 }}>
          Vitals saved and synced! Your care team can see the update immediately.
        </Alert>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">Log your vitals</span>
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
                {['Positive', 'Steady', 'Tired', 'Anxious', 'Painful', 'Excellent'].map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <button className="btn btn--primary btn--full form-grid--full" onClick={saveVitals}>
              {saved ? 'Saved!' : 'Save and share with care team'}
            </button>
          </div>
        </div>

        <div className="card-stack">
          <div className="card">
            <div className="card__header">
              <span className="card__title">Recent vitals history</span>
              <Badge variant="green">{history.length} records</Badge>
            </div>
            <div className="card__body stack-list">
              {history.length === 0 && <p className="text-muted text-center">No vitals recorded yet.</p>}
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

          <RecoveryInsights patientId={patientId} compact />
        </div>
      </div>
    </div>
  );
};

export default PatientVitals;
