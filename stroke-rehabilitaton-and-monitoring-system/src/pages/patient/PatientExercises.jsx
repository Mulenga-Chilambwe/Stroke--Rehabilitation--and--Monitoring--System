import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, Modal } from '../../components/shared/UI';
import {
  difficultyVariant,
  getAssignedExercises,
  getPatientIdForUser,
  todayKey,
} from '../../utils/care';

const PatientExercises = () => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useStore();
  const patientId = getPatientIdForUser(currentUser);
  const assigned = getAssignedExercises(state, patientId);

  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('assigned');
  const [filter, setFilter] = useState('All');
  const [pain, setPain] = useState(0);
  const [notes, setNotes] = useState('');

  const categories = useMemo(
    () => ['All', ...new Set(state.exerciseLibrary.map((exercise) => exercise.category))],
    [state.exerciseLibrary]
  );

  const source = tab === 'assigned' ? assigned : state.exerciseLibrary;
  const filtered = filter === 'All'
    ? source
    : source.filter((exercise) => exercise.category === filter);

  const logSession = () => {
    if (!selected) return;
    const today = todayKey();

    dispatch((s) => {
      const existing = s.sessions.find(
        (session) =>
          session.patientId === patientId &&
          session.exerciseId === selected.id &&
          session.date === today
      );

      const sessionRecord = {
        patientId,
        exerciseId: selected.id,
        exercise: selected.name,
        duration: selected.duration,
        completed: true,
        pain,
        notes,
        loggedBy: 'patient',
      };

      return {
        ...s,
        sessions: existing
          ? s.sessions.map((session) =>
              session.id === existing.id ? { ...session, ...sessionRecord } : session
            )
          : [...s.sessions, { id: `s${Date.now()}`, date: today, ...sessionRecord }],
      };
    });

    setSelected(null);
    setPain(0);
    setNotes('');
  };

  const openExercise = (exercise) => {
    setSelected(exercise);
    setPain(0);
    setNotes('');
  };

  return (
    <div>
      <Alert variant="info" icon="Video" style={{ marginBottom: 18 }}>
        Watch your assigned therapy videos or browse the full library of {state.exerciseLibrary.length} short remote-physio videos.
      </Alert>

      <div className="therapy-toolbar anim-fade-up anim-delay-1">
        <div className="segmented">
          <button className={tab === 'assigned' ? 'active' : ''} onClick={() => setTab('assigned')}>
            Assigned plan
          </button>
          <button className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}>
            15-video library
          </button>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select-control">
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="video-grid anim-fade-up anim-delay-2">
        {filtered.map((exercise) => {
          const done = state.sessions.some(
            (session) =>
              session.patientId === patientId &&
              session.exerciseId === exercise.id &&
              session.date === todayKey() &&
              session.completed
          );

          return (
            <button key={exercise.id} className="video-card" onClick={() => openExercise(exercise)}>
              <div className="video-card__media video-card__media--youtube">
                <div className="video-card__initial">{exercise.icon}</div>
                <span className="video-card__play">Play</span>
                <span className="video-card__duration">{exercise.duration} min</span>
              </div>
              <div className="video-card__body">
                <div className="video-card__title">{exercise.name}</div>
                <div className="video-card__meta">{exercise.bodyPart} · {exercise.sets}</div>
                <div className="chip-row">
                  <Badge variant={difficultyVariant(exercise.difficulty)}>{exercise.difficulty}</Badge>
                  <Badge variant="blue">{exercise.category}</Badge>
                  {done && <Badge variant="green">Done today</Badge>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <Modal
          wide
          title={selected.name}
          onClose={() => setSelected(null)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn--primary" onClick={logSession}>Mark complete</button>
            </>
          }
        >
          <div className="exercise-detail">
            <iframe
              className="exercise-detail__video"
              src={selected.videoUrl}
              title={`${selected.name} rehabilitation video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <div>
              <div className="chip-row" style={{ marginBottom: 12 }}>
                <Badge variant="blue">{selected.category}</Badge>
                <Badge variant="muted">{selected.bodyPart}</Badge>
                <Badge variant={difficultyVariant(selected.difficulty)}>{selected.difficulty}</Badge>
              </div>
              <p style={{ lineHeight: 1.7, marginBottom: 12 }}>{selected.description}</p>
              <Alert variant="warn" icon="Safety" style={{ marginBottom: 16 }}>
                {selected.safety}
              </Alert>
              <a className="btn btn--outline btn--sm" href={selected.videoSearchUrl} target="_blank" rel="noreferrer" style={{ marginBottom: 16 }}>
                Open more real videos
              </a>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Pain level after exercise</label>
                <div className="pain-scale">
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      className={`pain-btn ${pain === level ? 'selected' : ''}`}
                      onClick={() => setPain(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Notes for your clinician</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel today?" />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientExercises;
