import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, StatCard } from '../../components/shared/UI';
import RecoveryInsights from '../../components/shared/RecoveryInsights';
import {
  getAssignedExercises,
  getCaregiverForPatient,
  getDoctorForPatient,
  getPatient,
  getPatientIdForUser,
  getPatientSessions,
  todayKey,
} from '../../utils/care';

const PatientDashboard = ({ setPage }) => {
  const { currentUser } = useAuth();
  const [state, dispatch, ctx] = useStore();
  const patientId = getPatientIdForUser(currentUser);
  const patient = getPatient(state, patientId);
  const caregiver = getCaregiverForPatient(state, patientId);
  const doctor = getDoctorForPatient(state, patientId);
  const assigned = getAssignedExercises(state, patientId);
  const sessions = getPatientSessions(state, patientId);
  const medications = state.medications[patientId] || [];
  const today = todayKey();
  const doneToday = sessions.filter((session) => session.date === today && session.completed).length;
  const dailyCount = assigned.filter((exercise) => exercise.freq === 'Daily').length || assigned.length;
  const medsTaken = medications.filter((med) => med.takenToday).length;
  const alerts = state.alerts.filter((a) => a.patientId === patientId && !a.read);

  const markComplete = (exercise) => {
    const sessionRecord = {
      patientId,
      exerciseId: exercise.id,
      exercise: exercise.name,
      duration: exercise.duration,
      completed: true,
      pain: 0,
      notes: '',
      loggedBy: 'patient',
    };
    dispatch((s) => {
      const existing = s.sessions.find(
        (session) => session.patientId === patientId && session.exerciseId === exercise.id && session.date === today
      );
      return {
        ...s,
        sessions: existing
          ? s.sessions.map((session) => session.id === existing.id ? { ...session, ...sessionRecord, date: today } : session)
          : [...s.sessions, { id: `s${Date.now()}`, date: today, ...sessionRecord }],
        alerts: [
          ...s.alerts,
          {
            id: `a${Date.now()}`,
            patientId,
            type: 'info',
            msg: `${patient.name} completed ${exercise.name}.`,
            time: 'Just now',
            read: false,
          },
        ],
      };
    });
    ctx.syncSession({ ...sessionRecord, date: today, id: `s${Date.now()}` });
  };

  return (
    <div>
      <section className="care-hero anim-fade-up anim-delay-1">
        <div>
          <span className="care-hero__eyebrow">Remote physiotherapy plan</span>
          <h2>Welcome back, {patient.name.split(' ')[0]}</h2>
          <p>
            Your caregiver <strong>{caregiver.name}</strong> and <strong>{doctor.name}</strong> are connected in real-time to this care record.
          </p>
          <div className="chip-row">
            <Badge variant="green">{patient.streak}-day streak</Badge>
            <Badge variant="blue">{assigned.length} assigned exercises</Badge>
            <Badge variant={medsTaken === medications.length ? 'green' : 'warn'}>
              {medsTaken}/{medications.length} meds today
            </Badge>
            <Badge variant={patient.risk === 'low' ? 'green' : patient.risk === 'moderate' ? 'warn' : 'red'}>
              {patient.risk} risk
            </Badge>
          </div>
        </div>
        <div className="recovery-ring">
          <strong>{patient.progress}%</strong>
          <span>recovery</span>
        </div>
      </section>

      <div className="grid-4 anim-fade-up anim-delay-2" style={{ marginBottom: 20 }}>
        <StatCard icon="Done" label="Today" value={`${doneToday}/${dailyCount}`} sub="therapy sessions" iconBg="#e6f9f0" />
        <StatCard icon="Video" label="Video Library" value={state.exerciseLibrary.length} sub="short exercises" iconBg="var(--clr-primary-lt)" />
        <StatCard icon="Vitals" label="Vitals" value={state.vitals[patientId]?.bp || '--'} sub={`HR ${state.vitals[patientId]?.heartRate || '--'} bpm`} iconBg="#fff5e6" />
        <StatCard icon="Msg" label="Care Team" value="2" sub="doctor + caregiver" iconBg="#e8ecfb" />
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'warning' ? 'warn' : 'info'} icon="Alert" style={{ marginBottom: 8 }}>
              {alert.msg}
            </Alert>
          ))}
        </div>
      )}

      <div className="grid-2 anim-fade-up anim-delay-3">
        <div className="card-stack">
          <div className="card">
            <div className="card__header">
              <span className="card__title">Today's assigned exercises</span>
              <button className="btn btn--outline btn--sm" onClick={() => setPage('exercises')}>Open videos</button>
            </div>
            <div className="card__body stack-list">
              {assigned.length === 0 && <p className="text-muted text-center">No exercises assigned yet. Your doctor will assign exercises soon.</p>}
              {assigned.slice(0, 5).map((exercise) => {
                const done = sessions.some(
                  (session) => session.date === today && session.exerciseId === exercise.id && session.completed
                );
                return (
                  <div key={exercise.id} className="care-row">
                    <div className="care-row__icon">{exercise.icon}</div>
                    <div style={{ flex: 1 }}>
                      <strong>{exercise.name}</strong>
                      <span>{exercise.bodyPart} · {exercise.sets} · {exercise.duration} min</span>
                    </div>
                    {done ? (
                      <Badge variant="green">Done</Badge>
                    ) : (
                      <button className="btn btn--primary btn--xs" onClick={() => markComplete(exercise)}>Done</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <span className="card__title">Medication tracker</span>
              <button className="btn btn--outline btn--sm" onClick={() => setPage('medications')}>Manage</button>
            </div>
            <div className="card__body stack-list">
              {medications.length === 0 && <p className="text-muted text-center">No medications prescribed.</p>}
              {medications.map((med) => (
                <div className="care-row" key={med.id}>
                  <div style={{ flex: 1 }}>
                    <strong>{med.name}</strong>
                    <span>{med.dose} · {med.schedule}</span>
                  </div>
                  <Badge variant={med.takenToday ? 'green' : 'warn'}>
                    {med.takenToday ? 'Taken' : 'Due'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <RecoveryInsights patientId={patientId} />
      </div>
    </div>
  );
};

export default PatientDashboard;
