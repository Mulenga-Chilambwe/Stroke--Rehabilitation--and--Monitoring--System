import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, Modal, ProgressBar, StatCard } from '../../components/shared/UI';
import {
  difficultyVariant,
  getAssignedExercises,
  getCaregiverForPatient,
  getDoctorIdForUser,
  getPatient,
  getPatientSessions,
  riskVariant,
} from '../../utils/care';

const useDoctorState = () => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useStore();
  const doctorId = getDoctorIdForUser(currentUser);
  const patients = state.patients.filter((patient) => patient.doctorId === doctorId);
  return { currentUser, state, dispatch, doctorId, patients };
};

const PatientSelector = ({ patients, selectedId, onSelect }) => (
  <select className="select-control" value={selectedId} onChange={(e) => onSelect(e.target.value)}>
    {patients.map((patient) => (
      <option key={patient.id} value={patient.id}>{patient.name}</option>
    ))}
  </select>
);

const HPDashboard = () => {
  const { state, patients } = useDoctorState();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || 'p1');
  const selected = getPatient(state, selectedId);
  const caregiver = getCaregiverForPatient(state, selectedId);
  const vitals = state.vitals[selectedId];
  const sessions = getPatientSessions(state, selectedId);
  const assigned = getAssignedExercises(state, selectedId);
  const unread = state.messages.filter((message) => message.to === 'hp' && !message.read).length;
  const alerts = state.alerts.filter((alert) => !alert.read);
  const avgProgress = Math.round(patients.reduce((sum, p) => sum + p.progress, 0) / Math.max(patients.length, 1));

  return (
    <div>
      <div className="grid-4 anim-fade-up anim-delay-1" style={{ marginBottom: 20 }}>
        <StatCard icon="Users" label="Patients" value={patients.length} sub="assigned to you" />
        <StatCard icon="Chart" label="Avg Recovery" value={`${avgProgress}%`} sub="all active patients" />
        <StatCard icon="Msg" label="Unread" value={unread} sub="messages" />
        <StatCard icon="Alert" label="Alerts" value={alerts.length} sub="clinical review" />
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">Assigned patients</span>
            <Badge variant="blue">{patients.length} cases</Badge>
          </div>
          <div className="card__body stack-list">
            {patients.map((patient) => {
              const patientAlerts = state.alerts.filter((alert) => alert.patientId === patient.id && !alert.read).length;
              return (
                <button
                  key={patient.id}
                  className={`patient-case ${selectedId === patient.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(patient.id)}
                >
                  <div className="patient-row__avatar" style={{ background: patient.risk === 'high' ? '#e05252' : '#3b5bdb' }}>
                    {patient.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>{patient.name}</strong>
                    <span>{patient.condition} · Caregiver: {getCaregiverForPatient(state, patient.id).name}</span>
                    <ProgressBar value={patient.progress} />
                  </div>
                  <Badge variant={riskVariant(patient.risk)}>{patient.risk}</Badge>
                  {patientAlerts > 0 && <Badge variant="red">{patientAlerts}</Badge>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-stack">
          <div className="card">
            <div className="card__header">
              <span className="card__title">{selected.name} clinical snapshot</span>
              <PatientSelector patients={patients} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
            <div className="card__body">
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span className="text-muted">Recovery progress</span>
                <strong>{selected.progress}%</strong>
              </div>
              <ProgressBar value={selected.progress} />
              <div className="divider" />
              <div className="vitals-grid">
                {[
                  ['Caregiver', caregiver.name],
                  ['Blood pressure', vitals?.bp],
                  ['Heart rate', `${vitals?.heartRate} bpm`],
                  ['Oxygen', `${vitals?.oxygenSat}%`],
                  ['Mood', vitals?.mood],
                  ['Assigned videos', assigned.length],
                ].map(([label, value]) => (
                  <div key={label} className="vital-cell">
                    <div>
                      <div className="vital-cell__label">{label}</div>
                      <div className="vital-cell__value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <span className="card__title">Recent weekly activity</span>
              <Badge variant="green">{sessions.filter((s) => s.completed).length}/{sessions.length}</Badge>
            </div>
            <div className="card__body stack-list">
              {[...sessions].reverse().slice(0, 5).map((session) => (
                <div key={session.id} className="care-row">
                  <div style={{ flex: 1 }}>
                    <strong>{session.exercise}</strong>
                    <span>{session.date} · {session.duration} min · by {session.loggedBy || 'unknown'}</span>
                  </div>
                  <Badge variant={session.completed ? 'green' : 'red'}>{session.completed ? 'Done' : 'Missed'}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HPExercisePlan = () => {
  const { state, dispatch, patients, currentUser } = useDoctorState();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || 'p1');
  const [focus, setFocus] = useState('All');
  const [preview, setPreview] = useState(null);
  const assigned = getAssignedExercises(state, selectedId);
  const assignedIds = state.assignments[selectedId] || [];
  const categories = useMemo(() => ['All', ...new Set(state.exerciseLibrary.map((exercise) => exercise.category))], [state.exerciseLibrary]);
  const library = focus === 'All'
    ? state.exerciseLibrary
    : state.exerciseLibrary.filter((exercise) => exercise.category === focus || exercise.bodyPart === focus);

  const assignExercise = (exercise) => {
    if (assignedIds.includes(exercise.id)) return;
    dispatch((s) => ({
      ...s,
      assignments: {
        ...s.assignments,
        [selectedId]: [...(s.assignments[selectedId] || []), exercise.id],
      },
      alerts: [
        ...s.alerts,
        {
          id: `a${Date.now()}`,
          patientId: selectedId,
          type: 'info',
          msg: `${currentUser.name} assigned ${exercise.name} to the therapy plan.`,
          time: 'Just now',
          read: false,
        },
      ],
    }));
  };

  const removeExercise = (exerciseId) => {
    dispatch((s) => ({
      ...s,
      assignments: {
        ...s.assignments,
        [selectedId]: (s.assignments[selectedId] || []).filter((id) => id !== exerciseId),
      },
    }));
  };

  return (
    <div>
      <div className="doctor-toolbar anim-fade-up anim-delay-1">
        <Alert variant="info" icon="Plan" style={{ margin: 0, flex: 1 }}>
          Assign exercises by body focus. The patient and caregiver portals update instantly.
        </Alert>
        <PatientSelector patients={patients} selectedId={selectedId} onSelect={setSelectedId} />
        <select className="select-control" value={focus} onChange={(e) => setFocus(e.target.value)}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">Current assigned plan</span>
            <Badge variant="blue">{assigned.length}</Badge>
          </div>
          <div className="card__body stack-list">
            {assigned.map((exercise) => (
              <div key={exercise.id} className="care-row">
                <div className="care-row__icon">{exercise.icon}</div>
                <div style={{ flex: 1 }}>
                  <strong>{exercise.name}</strong>
                  <span>{exercise.bodyPart} · {exercise.sets} · {exercise.freq}</span>
                </div>
                <Badge variant={difficultyVariant(exercise.difficulty)}>{exercise.difficulty}</Badge>
                <button className="btn btn--outline btn--xs" onClick={() => removeExercise(exercise.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <span className="card__title">Exercise video library</span>
            <Badge variant="green">{library.length} videos</Badge>
          </div>
          <div className="card__body library-list">
            {library.slice(0, 42).map((exercise) => (
              <div key={exercise.id} className="library-item">
                <button className="library-item__main" onClick={() => setPreview(exercise)}>
                  <strong>{exercise.name}</strong>
                  <span>{exercise.category} · {exercise.bodyPart} · {exercise.duration} min</span>
                </button>
                <button
                  className="btn btn--primary btn--xs"
                  disabled={assignedIds.includes(exercise.id)}
                  onClick={() => assignExercise(exercise)}
                >
                  {assignedIds.includes(exercise.id) ? 'Assigned' : 'Assign'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {preview && (
        <Modal title={preview.name} wide onClose={() => setPreview(null)}>
          <iframe
            className="exercise-detail__video"
            src={preview.videoUrl}
            title={`${preview.name} rehabilitation video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <p style={{ marginTop: 14, lineHeight: 1.7 }}>{preview.description}</p>
          <a className="btn btn--outline btn--sm mt-3" href={preview.videoSearchUrl} target="_blank" rel="noreferrer">
            Open more real videos
          </a>
        </Modal>
      )}
    </div>
  );
};

const HPReports = () => {
  const { state, patients } = useDoctorState();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || 'p1');
  const patient = getPatient(state, selectedId);
  const sessions = getPatientSessions(state, selectedId);
  const vitals = state.vitals[selectedId];
  const medication = state.medications[selectedId] || [];
  const history = state.vitalHistory.filter((entry) => entry.patientId === selectedId).slice(-8).reverse();

  return (
    <div>
      <div className="doctor-toolbar anim-fade-up anim-delay-1">
        <Alert variant="info" icon="Report" style={{ margin: 0, flex: 1 }}>
          Weekly activity, recovery, medication, pain, and caregiver-entered vitals for each patient.
        </Alert>
        <PatientSelector patients={patients} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">{patient.name} weekly activity</span>
            <Badge variant="blue">{sessions.filter((s) => s.completed).length}/{sessions.length}</Badge>
          </div>
          <div className="card__body" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Date', 'Exercise', 'Status', 'Pain', 'Logged by'].map((heading) => <th key={heading}>{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.date}</td>
                    <td>{session.exercise}</td>
                    <td><Badge variant={session.completed ? 'green' : 'red'}>{session.completed ? 'Done' : 'Missed'}</Badge></td>
                    <td>{session.pain > 0 ? <Badge variant={session.pain >= 4 ? 'red' : 'warn'}>{session.pain}/5</Badge> : '-'}</td>
                    <td>{session.loggedBy || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-stack">
          <div className="card">
            <div className="card__header">
              <span className="card__title">Clinical summary</span>
              <Badge variant={riskVariant(patient.risk)}>{patient.risk}</Badge>
            </div>
            <div className="card__body">
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span className="text-muted">Recovery progress</span>
                <strong>{patient.progress}%</strong>
              </div>
              <ProgressBar value={patient.progress} />
              <div className="divider" />
              <div className="vitals-grid">
                {[
                  ['BP', vitals?.bp],
                  ['Heart rate', `${vitals?.heartRate} bpm`],
                  ['Oxygen', `${vitals?.oxygenSat}%`],
                  ['Mood', vitals?.mood],
                ].map(([label, value]) => (
                  <div key={label} className="vital-cell">
                    <div>
                      <div className="vital-cell__label">{label}</div>
                      <div className="vital-cell__value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <span className="card__title">Medication and vitals history</span>
            </div>
            <div className="card__body stack-list">
              {medication.map((med) => (
                <div key={med.id} className="care-row">
                  <div style={{ flex: 1 }}>
                    <strong>{med.name}</strong>
                    <span>{med.dose} · {med.schedule}</span>
                  </div>
                  <Badge variant={med.takenToday ? 'green' : 'warn'}>{med.takenToday ? 'Taken' : 'Due'}</Badge>
                </div>
              ))}
              <div className="divider" />
              {history.map((entry) => (
                <div key={entry.id} className="care-row">
                  <div style={{ flex: 1 }}>
                    <strong>{entry.date}</strong>
                    <span>BP {entry.bp} · HR {entry.heartRate} · O2 {entry.oxygenSat}% · {entry.mood}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { HPDashboard, HPExercisePlan, HPReports };
