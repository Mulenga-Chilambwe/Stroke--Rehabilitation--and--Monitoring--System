/**
 * pages/patient/PatientMedications.jsx
 * ─────────────────────────────────────────────────────────────
 * Medication tracker — patients can add medications, mark them
 * as taken today, and view adherence counts. Data is shared
 * with caregiver and doctor portals.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge } from '../../components/shared/UI';
import { getPatientIdForUser } from '../../utils/care';

const emptyForm = { name: '', dose: '', schedule: 'Morning' };

const PatientMedications = () => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useStore();
  const patientId = getPatientIdForUser(currentUser);
  const medications = state.medications[patientId] || [];
  const [form, setForm] = useState(emptyForm);

  const updateTaken = (id) => {
    dispatch((s) => ({
      ...s,
      medications: {
        ...s.medications,
        [patientId]: (s.medications[patientId] || []).map((med) =>
          med.id === id ? { ...med, takenToday: !med.takenToday } : med
        ),
      },
    }));
  };

  const addMedication = () => {
    if (!form.name.trim() || !form.dose.trim()) return;
    dispatch((s) => ({
      ...s,
      medications: {
        ...s.medications,
        [patientId]: [
          ...(s.medications[patientId] || []),
          { id: `med${Date.now()}`, ...form, takenToday: false },
        ],
      },
    }));
    setForm(emptyForm);
  };

  return (
    <div>
      <Alert variant="info" icon="Meds" style={{ marginBottom: 18 }}>
        Track medication adherence here so your caregiver and doctor can see the same daily record.
      </Alert>

      <div className="grid-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">Today's medication record</span>
            <Badge variant="blue">{medications.filter((m) => m.takenToday).length}/{medications.length} taken</Badge>
          </div>
          <div className="card__body stack-list">
            {medications.map((med) => (
              <div key={med.id} className="care-row">
                <div style={{ flex: 1 }}>
                  <strong>{med.name}</strong>
                  <span>{med.dose} · {med.schedule}</span>
                </div>
                <button
                  className={`btn btn--xs ${med.takenToday ? 'btn--success' : 'btn--outline'}`}
                  onClick={() => updateTaken(med.id)}
                >
                  {med.takenToday ? 'Taken' : 'Mark taken'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <span className="card__title">Add medication</span>
          </div>
          <div className="card__body form-grid">
            <div className="field form-grid--full">
              <label>Medication name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Aspirin" />
            </div>
            <div className="field">
              <label>Dose</label>
              <input value={form.dose} onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))} placeholder="e.g. 81 mg" />
            </div>
            <div className="field">
              <label>Schedule</label>
              <select value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}>
                {['Morning', 'Afternoon', 'Night', 'As needed'].map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <button className="btn btn--primary btn--full form-grid--full" onClick={addMedication}>Add to record</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMedications;
