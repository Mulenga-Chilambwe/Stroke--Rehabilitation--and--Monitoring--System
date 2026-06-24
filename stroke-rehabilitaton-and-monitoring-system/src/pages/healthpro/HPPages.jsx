/**
 * pages/healthpro/HPPages.jsx
 * ─────────────────────────────────────────────────────────────
 * Health Professional portal pages — exported as named components:
 *   HPDashboard      – patient case overview with clinical snapshot
 *   HPExercisePlan   – assign / remove exercises per patient
 *   HPReports        – weekly activity table, vitals history
 *   HPRecordings     – upload, preview, and delete personalised
 *                      therapy recordings for each patient
 * ─────────────────────────────────────────────────────────────
 */

import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, Modal, ProgressBar, StatCard } from '../../components/shared/UI';
import {
  difficultyVariant,
  getAssignedExercises,
  getCaregiverForPatient,
  getDoctorIdForUser,
  getDoctorRecordings,
  getPatient,
  getPatientSessions,
  riskVariant,
  todayKey,
} from '../../utils/care';

const useDoctorState = () => {
  const { currentUser } = useAuth();
  const [state, dispatch, ctx] = useStore();
  const doctorId = getDoctorIdForUser(currentUser);
  const patients = state.patients.filter((patient) => patient.doctorId === doctorId);
  return { currentUser, state, dispatch, ctx, doctorId, patients };
};

const PatientSelector = ({ patients, selectedId, onSelect }) => (
  <select className="select-control" value={selectedId} onChange={(e) => onSelect(e.target.value)}>
    {patients.map((patient) => (
      <option key={patient.id} value={patient.id}>{patient.name}</option>
    ))}
  </select>
);

const NoAssignedPatients = () => (
  <div className="card anim-fade-up">
    <div className="card__header">
      <span className="card__title">No assigned patients yet</span>
      <Badge variant="muted">0 cases</Badge>
    </div>
    <div className="card__body">
      <p className="text-muted" style={{ lineHeight: 1.7 }}>
        Patient records will appear here after a patient selects you as their available doctor during registration.
      </p>
    </div>
  </div>
);

const HPDashboard = () => {
  const { state, patients } = useDoctorState();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || 'p1');
  if (patients.length === 0) return <NoAssignedPatients />;

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

  if (patients.length === 0) return <NoAssignedPatients />;

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
  if (patients.length === 0) return <NoAssignedPatients />;

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

const HPRecordings = () => {
  const { state, dispatch, patients, currentUser, ctx } = useDoctorState();
  const [selectedId, setSelectedId] = useState(patients[0]?.id || 'p1');
  const [preview, setPreview] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [upload, setUpload] = useState({
    title: '',
    description: '',
    notes: '',
    exerciseId: '',
    file: null,
    videoUrl: '',
  });
  const [uploadMethod, setUploadMethod] = useState('file');

  const doctorId = getDoctorIdForUser(currentUser);
  const recordings = getDoctorRecordings(state, doctorId);
  const patientRecordings = recordings.filter((r) => r.patientId === selectedId);
  const assigned = getAssignedExercises(state, selectedId);

  if (patients.length === 0) return <NoAssignedPatients />;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUpload((prev) => ({ ...prev, file, videoUrl: url }));
  };

  const handleUpload = () => {
    if (!upload.title || !upload.videoUrl) return;
    const recording = {
      id: `rec-${Date.now()}`,
      doctorId,
      patientId: selectedId,
      exerciseId: upload.exerciseId || null,
      title: upload.title,
      description: upload.description,
      notes: upload.notes,
      videoUrl: upload.videoUrl,
      fileName: upload.file?.name || 'external-link',
      uploadedAt: todayKey(),
      duration: 0,
      views: 0,
    };

    dispatch((s) => ({
      ...s,
      recordings: [...s.recordings, recording],
      alerts: [
        ...s.alerts,
        {
          id: `a${Date.now()}`,
          patientId: selectedId,
          type: 'info',
          msg: `${currentUser.name} uploaded a new recording: ${upload.title}`,
          time: 'Just now',
          read: false,
        },
      ],
    }));
    ctx.syncRecording(recording);
    setShowUpload(false);
    setUpload({ title: '', description: '', notes: '', exerciseId: '', file: null, videoUrl: '' });
  };

  const deleteRecording = (recordingId) => {
    dispatch((s) => ({
      ...s,
      recordings: s.recordings.filter((r) => r.id !== recordingId),
    }));
    if (preview?.id === recordingId) setPreview(null);
  };

  const patientRecordingCounts = patients.reduce((acc, p) => {
    acc[p.id] = recordings.filter((r) => r.patientId === p.id).length;
    return acc;
  }, {});

  const exerciseMap = {};
  state.exerciseLibrary.forEach((ex) => { exerciseMap[ex.id] = ex; });

  return (
    <div>
      <div className="doctor-toolbar anim-fade-up anim-delay-1">
        <Alert variant="info" icon="Recording" style={{ margin: 0, flex: 1 }}>
          Upload and manage personalised recorded therapy sessions for your patients.
          These appear instantly in the patient and caregiver portals.
        </Alert>
        <PatientSelector patients={patients} selectedId={selectedId} onSelect={setSelectedId} />
        <button className="btn btn--primary btn--sm" onClick={() => setShowUpload(true)}>
          + New Recording
        </button>
      </div>

      <div className="recording-summary grid-4 anim-fade-up anim-delay-1" style={{ marginBottom: 20 }}>
        {patients.map((patient) => (
          <button
            key={patient.id}
            className={`stat-card recording-stat ${selectedId === patient.id ? 'active' : ''}`}
            onClick={() => setSelectedId(patient.id)}
          >
            <div className="stat-card__icon" style={{ background: 'var(--clr-primary-lt)' }}>Rec</div>
            <div className="stat-card__label">{patient.name.split(' ')[0]}</div>
            <div className="stat-card__value">{patientRecordingCounts[patient.id] || 0}</div>
            <div className="stat-card__sub">recordings</div>
          </button>
        ))}
      </div>

      <div className="anim-fade-up anim-delay-2">
        {patientRecordings.length === 0 ? (
          <div className="card">
            <div className="card__header">
              <span className="card__title">No recordings for this patient yet</span>
            </div>
            <div className="card__body">
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                Upload your first personalised therapy recording for {patients.find((p) => p.id === selectedId)?.name}.
                You can record a demonstration, a guided exercise routine, or personalised feedback.
              </p>
              <button className="btn btn--primary btn--sm mt-3" onClick={() => setShowUpload(true)}>
                + Upload Recording
              </button>
            </div>
          </div>
        ) : (
          <div className="video-grid">
            {[...patientRecordings].reverse().map((recording) => {
              const exercise = recording.exerciseId ? exerciseMap[recording.exerciseId] : null;
              return (
                <button key={recording.id} className="video-card recording-card" onClick={() => setPreview(recording)}>
                  <div className="video-card__media video-card__media--recording" style={{ background: 'var(--clr-primary-dk)' }}>
                    <div className="video-card__initial">{exercise?.icon || 'Rec'}</div>
                    <span className="video-card__play">Play</span>
                    {recording.duration > 0 && <span className="video-card__duration">{recording.duration} min</span>}
                    <span className="recording-badge-recording">Recorded</span>
                  </div>
                  <div className="video-card__body">
                    <div className="video-card__title">{recording.title}</div>
                    <div className="video-card__meta">
                      {recording.uploadedAt} · {recording.views} view{recording.views !== 1 ? 's' : ''}
                      {exercise && ` · ${exercise.name}`}
                    </div>
                    <div className="chip-row">
                      <Badge variant="blue">Personalised</Badge>
                      {recording.exerciseId && <Badge variant="green">Linked to exercise</Badge>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {preview && (
        <Modal
          wide
          title={preview.title}
          onClose={() => setPreview(null)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setPreview(null)}>Close</button>
              <button className="btn btn--danger btn--sm" onClick={() => deleteRecording(preview.id)}>Delete Recording</button>
            </>
          }
        >
          <div className="exercise-detail">
            <video
              className="exercise-detail__video"
              src={preview.videoUrl}
              controls
              style={{ background: '#000', borderRadius: 8 }}
            >
              Your browser does not support the video tag.
            </video>
            <div>
              <div className="chip-row" style={{ marginBottom: 12 }}>
                <Badge variant="blue">Recorded Session</Badge>
                <Badge variant="muted">{preview.uploadedAt}</Badge>
                <Badge variant="green">{preview.views} view{preview.views !== 1 ? 's' : ''}</Badge>
              </div>
              <p style={{ lineHeight: 1.7, marginBottom: 12 }}>{preview.description}</p>
              {preview.notes && (
                <Alert variant="info" icon="Note" style={{ marginBottom: 16 }}>
                  {preview.notes}
                </Alert>
              )}
              {preview.fileName !== 'external-link' && (
                <p className="text-muted" style={{ fontSize: 13 }}>File: {preview.fileName}</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {showUpload && (
        <Modal
          title="Upload Recorded Therapy Session"
          onClose={() => { setShowUpload(false); setUpload({ title: '', description: '', notes: '', exerciseId: '', file: null, videoUrl: '' }); }}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => { setShowUpload(false); setUpload({ title: '', description: '', notes: '', exerciseId: '', file: null, videoUrl: '' }); }}>Cancel</button>
              <button className="btn btn--primary" disabled={!upload.title || !upload.videoUrl} onClick={handleUpload}>
                Upload Recording
              </button>
            </>
          }
        >
          <div className="upload-form">
            <div className="upload-method-toggle">
              <button
                className={`btn btn--sm ${uploadMethod === 'file' ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setUploadMethod('file')}
              >
                Upload Video File
              </button>
              <button
                className={`btn btn--sm ${uploadMethod === 'url' ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setUploadMethod('url')}
              >
                Paste Video Link
              </button>
            </div>

            <div className="field">
              <label>Recording title *</label>
              <input
                type="text"
                placeholder="e.g. Finger Tap Technique - Personalised Guide"
                value={upload.title}
                onChange={(e) => setUpload((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {uploadMethod === 'file' ? (
              <div className="field">
                <label>Select video file *</label>
                <input type="file" accept="video/*" onChange={handleFileChange} />
                {upload.file && (
                  <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                    {upload.file.name} ({(upload.file.size / 1048576).toFixed(1)} MB)
                  </p>
                )}
              </div>
            ) : (
              <div className="field">
                <label>Video URL *</label>
                <input
                  type="url"
                  placeholder="https://example.com/your-video.mp4"
                  value={upload.videoUrl}
                  onChange={(e) => setUpload((prev) => ({ ...prev, videoUrl: e.target.value }))}
                />
              </div>
            )}

            <div className="field">
              <label>Assign to patient</label>
              <select
                className="select-control"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Link to exercise (optional)</label>
              <select
                className="select-control"
                value={upload.exerciseId}
                onChange={(e) => setUpload((prev) => ({ ...prev, exerciseId: e.target.value }))}
              >
                <option value="">— Not linked —</option>
                {assigned.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                ))}
                {state.exerciseLibrary.filter((ex) => !assigned.find((a) => a.id === ex.id)).map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>{exercise.name} (library)</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                placeholder="Describe what this recording covers and how it helps the patient..."
                value={upload.description}
                onChange={(e) => setUpload((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Clinical notes for patient</label>
              <textarea
                placeholder="Instructions, precautions, or specific guidance for this session..."
                value={upload.notes}
                onChange={(e) => setUpload((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {upload.videoUrl && (
              <div className="field">
                <label>Preview</label>
                <video
                  src={upload.videoUrl}
                  controls
                  style={{ width: '100%', maxHeight: 240, borderRadius: 8, background: '#000' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export { HPDashboard, HPExercisePlan, HPReports, HPRecordings };
