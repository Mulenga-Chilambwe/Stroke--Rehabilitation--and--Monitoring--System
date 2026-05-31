import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Badge, ProgressBar, StatCard } from '../../components/shared/UI';
import { getPatient, getPatientIdForUser, getPatientSessions } from '../../utils/care';

const PatientProgress = () => {
  const { currentUser } = useAuth();
  const [state] = useStore();
  const patientId = getPatientIdForUser(currentUser);
  const patient = getPatient(state, patientId);
  const sessions = getPatientSessions(state, patientId);
  const completed = sessions.filter((session) => session.completed).length;
  const painReports = sessions.filter((session) => session.pain > 0);
  const vitals = state.vitals[patientId];
  const medication = state.medications[patientId] || [];

  return (
    <div>
      <div className="grid-4 anim-fade-up anim-delay-1" style={{ marginBottom: 20 }}>
        <StatCard icon="Chart" label="Recovery" value={`${patient.progress}%`} sub={patient.condition} />
        <StatCard icon="Done" label="Sessions" value={completed} sub={`${patient.totalSessions}/${patient.targetSessions} target`} />
        <StatCard icon="Streak" label="Streak" value={patient.streak} sub="days active" />
        <StatCard icon="Meds" label="Medicine" value={`${medication.filter((m) => m.takenToday).length}/${medication.length}`} sub="taken today" />
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">Recovery record</span>
            <Badge variant="blue">{completed}/{sessions.length} completed</Badge>
          </div>
          <div className="card__body">
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <span className="text-muted">Overall recovery</span>
              <strong>{patient.progress}%</strong>
            </div>
            <ProgressBar value={patient.progress} />
            <div className="divider" />
            <div className="stack-list">
              {[...sessions].reverse().map((session) => (
                <div key={session.id} className="care-row">
                  <div className="care-row__icon">{session.completed ? 'OK' : 'Miss'}</div>
                  <div style={{ flex: 1 }}>
                    <strong>{session.exercise}</strong>
                    <span>{session.date} · {session.duration} min · logged by {session.loggedBy || 'unknown'}</span>
                    {session.notes && <small>{session.notes}</small>}
                  </div>
                  {session.pain > 0 && <Badge variant={session.pain >= 4 ? 'red' : 'warn'}>Pain {session.pain}/5</Badge>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-stack">
          <div className="card">
            <div className="card__header">
              <span className="card__title">Latest wellbeing</span>
              <Badge variant="green">{vitals?.lastUpdated}</Badge>
            </div>
            <div className="card__body vitals-grid">
              {[
                ['Heart rate', `${vitals?.heartRate} bpm`],
                ['Blood pressure', vitals?.bp],
                ['Oxygen', `${vitals?.oxygenSat}%`],
                ['Sleep', `${vitals?.sleep} hours`],
                ['Mood', vitals?.mood],
                ['Weight', `${vitals?.weight} kg`],
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

          <div className="card">
            <div className="card__header">
              <span className="card__title">Pain and notes</span>
              <Badge variant={painReports.length ? 'warn' : 'green'}>{painReports.length}</Badge>
            </div>
            <div className="card__body stack-list">
              {painReports.length === 0 && <p className="text-muted text-center">No pain reported.</p>}
              {painReports.map((session) => (
                <div key={session.id} className="care-row">
                  <div style={{ flex: 1 }}>
                    <strong>{session.exercise}</strong>
                    <span>{session.date}</span>
                  </div>
                  <Badge variant={session.pain >= 4 ? 'red' : 'warn'}>{session.pain}/5</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProgress;
