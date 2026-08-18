/**
 * pages/patient/PatientRecordings.jsx
 * ─────────────────────────────────────────────────────────────
 * Personalised therapy recordings uploaded by the health
 * professional. Patients can view streaming video, see doctor
 * instructions, and recordings are tracked with view counts.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, Modal } from '../../components/shared/UI';
import { getPatientIdForUser, getPatientRecordings } from '../../utils/care';

const PatientRecordings = () => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useStore();
  const patientId = getPatientIdForUser(currentUser);
  const recordings = getPatientRecordings(state, patientId);
  const [preview, setPreview] = useState(null);

  const exerciseMap = {};
  (state.exerciseLibrary || []).forEach((ex) => { exerciseMap[ex.id] = ex; });

  const markViewed = (recording) => {
    dispatch((s) => ({
      ...s,
      recordings: s.recordings.map((r) =>
        r.id === recording.id ? { ...r, views: (r.views || 0) + 1 } : r
      ),
    }));
  };

  const doctor = (state.doctors || []).find((d) => d.id === currentUser.doctorId) || (state.doctors || [])[0];

  return (
    <div>
      <Alert variant="info" icon="Recording" style={{ marginBottom: 18 }}>
        Personalised therapy sessions recorded by <strong>{doctor.name}</strong>.
        These are custom-made for your recovery plan.
      </Alert>

      {recordings.length === 0 ? (
        <div className="card anim-fade-up">
          <div className="card__header">
            <span className="card__title">No recordings yet</span>
          </div>
          <div className="card__body">
            <p className="text-muted" style={{ lineHeight: 1.7 }}>
              Your doctor hasn&apos;t uploaded any personalised recordings yet.
              They will appear here when your care team shares a recorded therapy session with you.
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
                onClick={() => { setPreview(recording); markViewed(recording); }}
              >
                <div className="video-card__media video-card__media--recording" style={{ background: 'var(--clr-primary)' }}>
                  <div className="video-card__initial">{exercise?.icon || 'Rec'}</div>
                  <span className="video-card__play">Play</span>
                  {recording.duration > 0 && <span className="video-card__duration">{recording.duration} min</span>}
                  <span className="recording-badge-recording">From Dr.</span>
                </div>
                <div className="video-card__body">
                  <div className="video-card__title">{recording.title}</div>
                  <div className="video-card__meta">
                    {recording.uploadedAt}
                    {exercise && ` · ${exercise.name}`}
                  </div>
                  <div className="chip-row">
                    <Badge variant="blue">Personalised</Badge>
                    {recording.notes && <Badge variant="green">Has instructions</Badge>}
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

export default PatientRecordings;
