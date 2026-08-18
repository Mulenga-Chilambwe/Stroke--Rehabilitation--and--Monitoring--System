import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, ProgressBar, StatCard } from '../../components/shared/UI';
import RecoveryInsights from '../../components/shared/RecoveryInsights';
import {
  getAssignedExercises,
  getDoctorForPatient,
  getPatient,
  getPatientIdForUser,
  getPatientSessions,
  todayKey,
} from '../../utils/care';

const CaregiverDashboard = ({ setPage }) => {
  const { currentUser } = useAuth();
  const [state, dispatch, ctx] = useStore();
  const patientId = getPatientIdForUser(currentUser);
  const patient = getPatient(state, patientId);
  const doctor = getDoctorForPatient(state, patientId);
  const vitals = (state.vitals || {})[patientId];
  const assigned = getAssignedExercises(state, patientId);
  const sessions = getPatientSessions(state, patientId);
  const medication = (state.medications || {})[patientId] || [];
  const alerts = (state.alerts || []).filter((alert) => alert.patientId === patientId);
  const today = todayKey();
  const doneToday = sessions.filter((session) => session.date === today && session.completed).length;

  const markDone = (exercise) => {
    const sessionRecord = {
      patientId,
      exerciseId: exercise.id,
      exercise: exercise.name,
      duration: exercise.duration,
      completed: true,
      pain: 0,
      notes: 'Completed with caregiver support.',
      loggedBy: 'caregiver',
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
            msg: `${currentUser.name} marked ${exercise.name} as done.`,
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
      <Alert variant="info" icon="Care" style={{ marginBottom: 18 }}>
        You are supporting <strong>{patient.name}</strong> and sharing real-time updates with <strong>{doctor.name}</strong>.
      </Alert>

      <div className="grid-4 anim-fade-up anim-delay-1" style={{ marginBottom: 20 }}>
        <StatCard icon="Chart" label="Recovery" value={`${patient.progress}%`} sub={patient.condition} />
        <StatCard icon="Done" label="Today" value={`${doneToday}/${assigned.length}`} sub="exercises completed" />
        <StatCard icon="Vitals" label="Vitals" value={vitals?.bp || '--'} sub={`HR ${vitals?.heartRate || '--'} bpm`} />
        <StatCard icon="Alert" label="Alerts" value={alerts.filter((a) => !a.read).length} sub="need review" />
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        <div className="card-stack">
          <div className="card">
            <div className="card__header">
              <span className="card__title">{patient.name}'s wellbeing</span>
              <Badge variant={patient.risk === 'low' ? 'green' : patient.risk === 'moderate' ? 'warn' : 'red'}>
                {patient.risk} risk
              </Badge>
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
                  ['Blood pressure', vitals?.bp || '--'],
                  ['Heart rate', vitals?.heartRate ? `${vitals.heartRate} bpm` : '--'],
                  ['Oxygen', vitals?.oxygenSat ? `${vitals.oxygenSat}%` : '--'],
                  ['Sleep', vitals?.sleep ? `${vitals.sleep} hours` : '--'],
                  ['Mood', vitals?.mood || '--'],
                  ['Last update', vitals?.lastUpdated || '--'],
                ].map(([label, value]) => (
                  <div className="vital-cell" key={label}>
                    <div>
                      <div className="vital-cell__label">{label}</div>
                      <div className="vital-cell__value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn--primary btn--full mt-4" onClick={() => setPage('vitals')}>Log new vitals</button>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <span className="card__title">Today's therapy support</span>
              <Badge variant="blue">{assigned.length} assigned</Badge>
            </div>
            <div className="card__body stack-list">
              {assigned.length === 0 && <p className="text-muted text-center">No exercises assigned yet.</p>}
              {assigned.slice(0, 6).map((exercise) => {
                const done = sessions.some(
                  (session) => session.date === today && session.exerciseId === exercise.id && session.completed
                );
                return (
                  <div key={exercise.id} className="care-row">
                    <div className="care-row__icon">{exercise.icon}</div>
                    <div style={{ flex: 1 }}>
                      <strong>{exercise.name}</strong>
                      <span>{exercise.bodyPart} · {exercise.sets}</span>
                    </div>
                    {done ? <Badge variant="green">Done</Badge> : <button className="btn btn--accent btn--xs" onClick={() => markDone(exercise)}>Done</button>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <span className="card__title">Medication check</span>
              <Badge variant="blue">{medication.filter((m) => m.takenToday).length}/{medication.length}</Badge>
            </div>
            <div className="card__body stack-list">
              {medication.length === 0 && <p className="text-muted text-center">No medications prescribed.</p>}
              {medication.map((med) => (
                <div key={med.id} className="care-row">
                  <div style={{ flex: 1 }}>
                    <strong>{med.name}</strong>
                    <span>{med.dose} · {med.schedule}</span>
                  </div>
                  <Badge variant={med.takenToday ? 'green' : 'warn'}>{med.takenToday ? 'Taken' : 'Due'}</Badge>
                </div>
              ))}
            </div>
          </div>

          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'warning' ? 'warn' : 'info'} icon="Alert">
              {alert.msg}
            </Alert>
          ))}
        </div>

        <RecoveryInsights patientId={patientId} />
      </div>
    </div>
  );
};

export default CaregiverDashboard;
