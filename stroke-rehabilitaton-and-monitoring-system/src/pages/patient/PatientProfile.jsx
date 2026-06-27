import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge } from '../../components/shared/UI';
import { getPatient } from '../../utils/care';

const SECTION_KEYS = {
  personal: [
    { key: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 62' },
    { key: 'condition', label: 'Condition', type: 'text', placeholder: 'e.g. Ischemic Stroke' },
    { key: 'strokeType', label: 'Stroke Type', type: 'select', options: ['', 'Ischemic Stroke', 'Hemorrhagic Stroke', 'Transient Ischemic Attack', 'Brainstem Stroke', 'Cryptogenic Stroke'] },
    { key: 'strokeDate', label: 'Date of Stroke', type: 'date' },
    { key: 'affectedSide', label: 'Affected Side', type: 'select', options: ['', 'Left', 'Right', 'Both', 'None'] },
    { key: 'initialSymptoms', label: 'Initial Symptoms', type: 'textarea', placeholder: 'Describe the initial symptoms experienced...' },
  ],
  medical: [
    { key: 'preExistingConditions', label: 'Pre-existing Conditions', type: 'textarea', placeholder: 'e.g. Hypertension, Diabetes, Atrial Fibrillation...' },
    { key: 'allergies', label: 'Allergies', type: 'textarea', placeholder: 'e.g. Penicillin, Latex, None known...' },
    { key: 'familyHistory', label: 'Family History', type: 'textarea', placeholder: 'e.g. Stroke, Heart disease in immediate family...' },
  ],
  rehab: [
    { key: 'rehabGoals', label: 'Rehabilitation Goals', type: 'textarea', placeholder: 'e.g. Regain full hand movement, walk independently, return to work...' },
    { key: 'preferredDays', label: 'Preferred Therapy Days', type: 'text', placeholder: 'e.g. Monday, Wednesday, Friday mornings' },
    { key: 'mobilityLevel', label: 'Mobility Level', type: 'select', options: ['', 'independent', 'minimal assistance', 'moderate assistance', 'dependent'] },
    { key: 'speechStatus', label: 'Speech Status', type: 'select', options: ['', 'normal', 'mild impairment', 'moderate impairment', 'severe impairment'] },
    { key: 'cognitiveStatus', label: 'Cognitive Status', type: 'select', options: ['', 'normal', 'mild impairment', 'moderate impairment', 'severe impairment'] },
  ],
};

const ProfileSection = ({ title, icon, fields, data, editing, onFieldChange, onSave }) => {
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    await onSave();
    setSaving(false);
  };
  return (
    <div className="card">
      <div className="card__header">
        <span className="card__title">{icon} {title}</span>
        {editing && <button className="btn btn--primary btn--sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Section'}</button>}
      </div>
      <div className="card__body">
        <div className="profile-fields">
          {fields.map(({ key, label, type, placeholder, options }) => {
            const value = data[key] || '';
            return (
              <div className="profile-field" key={key}>
                <label>{label}</label>
                {editing ? (
                  type === 'textarea' ? (
                    <textarea
                      value={value}
                      onChange={(e) => onFieldChange(key, e.target.value)}
                      placeholder={placeholder}
                    />
                  ) : type === 'select' ? (
                    <select value={value} onChange={(e) => onFieldChange(key, e.target.value)}>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>{opt || '-- Select --'}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => onFieldChange(key, e.target.value)}
                      placeholder={placeholder}
                    />
                  )
                ) : (
                  <span className="profile-value">{value || <span className="text-muted">Not provided</span>}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PatientProfile = () => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useStore();
  const patientId = currentUser.patientId || 'p1';
  const patient = getPatient(state, patientId);

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});


  useEffect(() => {
    if (patient) {
      setEditData({
        age: patient.age || '',
        condition: patient.condition || '',
        strokeType: patient.strokeType || '',
        strokeDate: patient.strokeDate || '',
        affectedSide: patient.affectedSide || '',
        initialSymptoms: patient.initialSymptoms || '',
        preExistingConditions: patient.preExistingConditions || '',
        allergies: patient.allergies || '',
        familyHistory: patient.familyHistory || '',
        rehabGoals: patient.rehabGoals || '',
        preferredDays: patient.preferredDays || '',
        mobilityLevel: patient.mobilityLevel || '',
        speechStatus: patient.speechStatus || '',
        cognitiveStatus: patient.cognitiveStatus || '',
      });
    }
  }, [patient]);

  const handleFieldChange = (key, value) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSection = () => {
    dispatch((s) => ({
      ...s,
      patients: s.patients.map((p) =>
        p.id === patientId
          ? { ...p, ...editData, patientEntered: true }
          : p
      ),
      alerts: [
        ...s.alerts,
        {
          id: `a${Date.now()}`,
          patientId,
          type: 'info',
          msg: 'Your profile information has been updated and is now shared with your care team.',
          time: 'Just now',
          read: false,
        },
      ],
    }));
  };

  const toggleEdit = () => {
    if (editMode) {
      handleSaveSection();
    }
    setEditMode(!editMode);
  };

  if (!patient) {
    return (
      <div className="card anim-fade-up">
        <div className="card__body">
          <p className="text-muted text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  const hasEnteredData = patient.patientEntered || editData.strokeType;

  return (
    <div>
      <div className="doctor-toolbar anim-fade-up anim-delay-1" style={{ marginBottom: 18 }}>
        <Alert variant="info" icon="Profile" style={{ margin: 0, flex: 1 }}>
          Manage your personal health profile. Information you enter here is shared with your doctor and caregiver.
        </Alert>
        <button className={`btn ${editMode ? 'btn--primary' : 'btn--outline'} btn--sm`} onClick={toggleEdit}>
          {editMode ? 'Save All Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        <div className="card-stack">
          <ProfileSection
            title="Personal & Stroke Details"
            icon="Heart"
            fields={SECTION_KEYS.personal}
            data={editData}
            editing={editMode}
            onFieldChange={handleFieldChange}
            onSave={handleSaveSection}
          />
          <ProfileSection
            title="Medical History"
            icon="Medical"
            fields={SECTION_KEYS.medical}
            data={editData}
            editing={editMode}
            onFieldChange={handleFieldChange}
            onSave={handleSaveSection}
          />
        </div>

        <div className="card-stack">
          <ProfileSection
            title="Rehabilitation Goals & Status"
            icon="Target"
            fields={SECTION_KEYS.rehab}
            data={editData}
            editing={editMode}
            onFieldChange={handleFieldChange}
            onSave={handleSaveSection}
          />

          <div className="card">
            <div className="card__header">
              <span className="card__title">Privacy Status</span>
            </div>
            <div className="card__body">
              <div className="profile-fields">
                <div className="profile-field">
                  <label>Profile Status</label>
                  {hasEnteredData ? (
                    <span><Badge variant="green">Information shared with your care team</Badge></span>
                  ) : (
                    <span><Badge variant="warn">Waiting for your information</Badge></span>
                  )}
                </div>
                <div className="profile-field">
                  <label>What your care team sees</label>
                  <span className="text-muted" style={{ fontSize: '.78rem', lineHeight: 1.6 }}>
                    {hasEnteredData
                      ? 'Your doctor and caregiver can view all the information you have entered above. Update your information anytime.'
                      : 'Your doctor and caregiver will only see your name and basic registration info until you fill in your health details.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;