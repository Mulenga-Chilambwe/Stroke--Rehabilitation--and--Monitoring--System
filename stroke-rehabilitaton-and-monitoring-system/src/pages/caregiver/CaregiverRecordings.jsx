/**
 * pages/caregiver/CaregiverRecordings.jsx
 * ─────────────────────────────────────────────────────────────
 * Caregiver view of doctor-uploaded therapy recordings.
 * Displays personalised sessions for the assigned patient
 * with video playback and doctor's notes.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, Modal } from '../../components/shared/UI';
import { getPatientRecordings, getPatient } from '../../utils/care';

const CaregiverRecordings = () => {
  const { currentUser } = useAuth();
  const [state] = useStore();
  const patientId = currentUser.patientId || '';
  const [preview, setPreview] = useState(null);

  if (!patientId) {
    return (
      <div className="card anim-fade-up">
        <div className="card__header">
          <span className="card__title">No patient assigned yet</span>
        </div>
        <div className="card__body">
          <p className="text-muted" style={{ lineHeight: 1.7 }}>
            Recordings from the doctor will appear here once a patient is assigned to your care.
          </p>
        </div>
      </div>
    );
  }

  const recordings = getPatientRecordings(state, patientId);
  const patient = getPatient(state, patientId);
  const doctor = state.doctors.find((d) => d.id === patient.doctorId) || state.doctors[0];

  const exerciseMap = {};
  state.exerciseLibrary.forEach((ex) => { exerciseMap[ex.id] = ex; });

  return (
    <div>
      <Alert variant="info" icon="Recording" style={{ marginBottom: 18 }}>
        Therapy recordings from <strong>{doctor.name}</strong> for <strong>{patient.name}</strong>.
        Review the doctor&apos;s guidance to help {patient.name.split(' ')[0]} during practice sessions.
      </Alert>

      {recordings.length === 0 ? (
        <div className="card anim-fade-up">
          <div className="card__header">
            <span className="card__title">No recordings yet</span>
          </div>
          <div className="card__body">
            <p className="text-muted" style={{ lineHeight: 1.7 }}>
              The doctor hasn&apos;t uploaded any personalised recordings for {patient.name} yet.
              They will appear here when shared.
            </p>
          </div>
        </div>
      ) : (
        <div className="video-grid anim-fade-up anim-delay-1">
          {[...recordings].reverse().map((recording) => {
            const exercise = recording.exerciseId ? exerciseMap[recording.exerciseId] : null;
            return (
              <button
                key={recording.id}
                className="video-card recording-card"
                onClick={() => setPreview(recording)}
              >
                <div className="video-card__media video-card__media--recording" style={{ background: 'var(--clr-primary)' }}>
                  <div className="video-card__initial">{exercise?.icon || 'Rec'}</div>
                  <span className="video-card__play">Play</span>
                  {recording.duration > 0 && <span className="video-card__duration">{recording.duration} min</span>}
                  <span className="recording-badge-recording">Dr.</span>
                </div>
                <div className="video-card__body">
                  <div className="video-card__title">{recording.title}</div>
                  <div className="video-card__meta">
                    {recording.uploadedAt}
                    {exercise && ` · ${exercise.name}`}
                  </div>
                  <div className="chip-row">
                    <Badge variant="blue">Personalised</Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {preview && (
        <Modal
          wide
          title={preview.title}
          onClose={() => setPreview(null)}
          footer={
            <button className="btn btn--outline" onClick={() => setPreview(null)}>Close</button>
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
                <Badge variant="blue">Recorded by {doctor.name}</Badge>
                <Badge variant="muted">{preview.uploadedAt}</Badge>
              </div>
              <p style={{ lineHeight: 1.7, marginBottom: 12 }}>{preview.description}</p>
              {preview.notes && (
                <Alert variant="info" icon="Note" style={{ marginBottom: 16 }}>
                  {preview.notes}
                </Alert>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CaregiverRecordings;
