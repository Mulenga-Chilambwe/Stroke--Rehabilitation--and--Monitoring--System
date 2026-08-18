import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, Modal } from '../../components/shared/UI';
import { getPatient } from '../../utils/care';

const PROFILE_FIELDS = [
  { key: 'relation', label: 'Relation to Patient', type: 'text', placeholder: 'e.g. Son, Daughter, Spouse' },
  { key: 'phone', label: 'Phone Number', type: 'text', placeholder: 'e.g. +260 97X XXX XXX' },
  { key: 'bio', label: 'About You', type: 'textarea', placeholder: 'Brief description of your role and availability...' },
];

const CaregiverProfile = () => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useStore();
  const patientId = currentUser.patientId || '';
  const patient = patientId ? getPatient(state, patientId) : null;
  const caregiverInfo = (state.caregivers || []).find((c) => c.id === currentUser.caregiverId);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    relation: currentUser.relation || caregiverInfo?.relation || '',
    phone: currentUser.phone || caregiverInfo?.phone || '',
    bio: currentUser.bio || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      relation: currentUser.relation || caregiverInfo?.relation || '',
      phone: currentUser.phone || caregiverInfo?.phone || '',
      bio: currentUser.bio || '',
    });
  }, [currentUser, caregiverInfo]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    dispatch((s) => ({
      ...s,
      caregivers: s.caregivers.map((c) =>
        c.id === currentUser.caregiverId
          ? { ...c, relation: formData.relation, phone: formData.phone }
          : c
      ),
    }));
    setEditMode(false);
    setSaving(false);
  };

  const hasPatientData = patient?.patientEntered;

  return (
    <div>
      <div className="doctor-toolbar anim-fade-up anim-delay-1" style={{ marginBottom: 18 }}>
        <Alert variant="info" icon="Profile" style={{ margin: 0, flex: 1 }}>
          Manage your caregiver profile visible to the care team.
        </Alert>
        <button
          className={`btn ${editMode ? 'btn--primary' : 'btn--outline'} btn--sm`}
          onClick={() => editMode ? handleSave() : setEditMode(true)}
        >
          {editMode ? (saving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
        </button>
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">Your Information</span>
          </div>
          <div className="card__body">
            <div className="profile-fields">
              <div className="profile-field">
                <label>Name</label>
                <span className="profile-value">{currentUser.name}</span>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <span className="profile-value">{currentUser.email}</span>
              </div>
              {PROFILE_FIELDS.map(({ key, label, type, placeholder }) => (
                <div className="profile-field" key={key}>
                  <label>{label}</label>
                  {editMode ? (
                    type === 'textarea' ? (
                      <textarea
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                      />
                    ) : (
                      <input
                        type={type}
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                      />
                    )
                  ) : (
                    <span className="profile-value">{formData[key] || <span className="text-muted">Not set</span>}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-stack">
          <div className="card">
            <div className="card__header">
              <span className="card__title">Assigned Patient</span>
              {patient && <Badge variant={hasPatientData ? 'green' : 'warn'}>{hasPatientData ? 'Info shared' : 'Awaiting info'}</Badge>}
            </div>
            <div className="card__body">
              {!patientId ? (
                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                  You have not been assigned to a patient yet. Once a patient registers with your caregiver email, their information will appear here.
                </p>
              ) : patient ? (
                <div>
                  <div className="patient-case" style={{ marginBottom: 12, cursor: 'default' }}>
                    <div className="patient-row__avatar" style={{ background: patient.risk === 'high' ? '#e05252' : '#3b5bdb' }}>
                      {patient.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong>{patient.name}</strong>
                      <span>{patient.condition || 'Awaiting condition info'}</span>
                    </div>
                    <Badge variant={patient.risk === 'high' ? 'red' : patient.risk === 'moderate' ? 'warn' : 'green'}>
                      {patient.risk}
                    </Badge>
                  </div>

                  {hasPatientData && (
                    <div className="profile-fields">
                      <div className="profile-field">
                        <label>Stroke Type</label>
                        <span className="profile-value">{patient.strokeType || 'Not provided'}</span>
                      </div>
                      <div className="profile-field">
                        <label>Affected Side</label>
                        <span className="profile-value">{patient.affectedSide || 'Not provided'}</span>
                      </div>
                      <div className="profile-field">
                        <label>Mobility Level</label>
                        <span className="profile-value">{patient.mobilityLevel || 'Not provided'}</span>
                      </div>
                      <div className="profile-field">
                        <label>Rehab Goals</label>
                        <span className="profile-value">{patient.rehabGoals || 'Not provided'}</span>
                      </div>
                    </div>
                  )}

                  {!hasPatientData && (
                    <Alert variant="warn" icon="Lock" style={{ marginTop: 8 }}>
                      Your patient has not yet entered their health details. Clinical information will appear here once they complete their profile.
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-muted text-center">Loading patient information...</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <span className="card__title">Your Role</span>
            </div>
            <div className="card__body">
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                As a caregiver, you can log vitals, record therapy sessions, view the doctor&apos;s recordings,
                and communicate with the care team. Your observations help the doctor make informed decisions.
              </p>
              <div className="chip-row" style={{ marginTop: 12 }}>
                <Badge variant="blue">Log Vitals</Badge>
                <Badge variant="green">Track Sessions</Badge>
                <Badge variant="warn">View Recordings</Badge>
                <Badge variant="muted">Send Messages</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverProfile;