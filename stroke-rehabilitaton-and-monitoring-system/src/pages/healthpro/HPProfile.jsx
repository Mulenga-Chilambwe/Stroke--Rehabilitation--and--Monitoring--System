import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Alert, Badge, Modal } from '../../components/shared/UI';

const PROFILE_FIELDS = [
  { key: 'title', label: 'Professional Title', type: 'text', placeholder: 'e.g. Rehabilitation Specialist' },
  { key: 'institution', label: 'Institution / Hospital', type: 'text', placeholder: 'e.g. Copperbelt University' },
  { key: 'phone', label: 'Phone Number', type: 'text', placeholder: 'e.g. +260 97X XXX XXX' },
  { key: 'licenseNumber', label: 'License Number', type: 'text', placeholder: 'e.g. MMCZ-2024-XXXX' },
  { key: 'yearsOfExperience', label: 'Years of Experience', type: 'number', placeholder: 'e.g. 15' },
  { key: 'officeLocation', label: 'Office Location', type: 'text', placeholder: 'e.g. CBU Teaching Hospital, Wing B' },
  { key: 'bio', label: 'Professional Bio', type: 'textarea', placeholder: 'Brief professional background, research interests, and clinical focus...' },
];

const HPProfile = () => {
  const { currentUser, updateDoctorAvailability } = useAuth();
  const [state, dispatch] = useStore();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: currentUser.title || '',
    institution: currentUser.institution || '',
    phone: currentUser.phone || '',
    licenseNumber: currentUser.licenseNumber || '',
    yearsOfExperience: currentUser.yearsOfExperience || '',
    officeLocation: currentUser.officeLocation || '',
    bio: currentUser.bio || '',
    name: currentUser.name || '',
  });
  const [saving, setSaving] = useState(false);

  const isAvailable = currentUser.isAvailable !== false;

  useEffect(() => {
    setFormData({
      title: currentUser.title || '',
      institution: currentUser.institution || '',
      phone: currentUser.phone || '',
      licenseNumber: currentUser.licenseNumber || '',
      yearsOfExperience: currentUser.yearsOfExperience || '',
      officeLocation: currentUser.officeLocation || '',
      bio: currentUser.bio || '',
      name: currentUser.name || '',
    });
  }, [currentUser]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    dispatch((s) => ({
      ...s,
      doctors: s.doctors.map((d) =>
        d.id === currentUser.doctorId
          ? { ...d, ...formData }
          : d
      ),
    }));
    setEditMode(false);
    setSaving(false);
  };

  const toggleAvailability = async () => {
    const nextAvailability = !isAvailable;
    await updateDoctorAvailability(nextAvailability);
    dispatch((s) => ({
      ...s,
      doctors: s.doctors.map((doctor) =>
        doctor.id === currentUser.doctorId
          ? { ...doctor, isAvailable: nextAvailability }
          : doctor
      ),
    }));
  };

  const doctorPatients = state.patients.filter((p) => p.doctorId === currentUser.doctorId);

  return (
    <div>
      <div className="doctor-toolbar anim-fade-up anim-delay-1" style={{ marginBottom: 18 }}>
        <Alert variant="info" icon="Profile" style={{ margin: 0, flex: 1 }}>
          Manage your professional profile visible to patients and caregivers.
        </Alert>
        <div className="flex-gap">
          <button
            className={`btn btn--sm ${isAvailable ? 'btn--success' : 'btn--outline'}`}
            onClick={toggleAvailability}
          >
            {isAvailable ? 'Available for Registration' : 'Mark Available'}
          </button>
          <button
            className={`btn ${editMode ? 'btn--primary' : 'btn--outline'} btn--sm`}
            onClick={() => editMode ? handleSave() : setEditMode(true)}
          >
            {editMode ? (saving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid-2 anim-fade-up anim-delay-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">Professional Information</span>
          </div>
          <div className="card__body">
            <div className="profile-fields">
              <div className="profile-field">
                <label>Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Your full name"
                  />
                ) : (
                  <span className="profile-value">{currentUser.name}</span>
                )}
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
              <span className="card__title">Availability Status</span>
              <Badge variant={isAvailable ? 'green' : 'muted'}>{isAvailable ? 'Online' : 'Offline'}</Badge>
            </div>
            <div className="card__body">
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                When you are <strong>available</strong>, new patients can select you as their doctor during registration.
                Toggle this off when you are not accepting new patients.
              </p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Badge variant={isAvailable ? 'green' : 'muted'}>{isAvailable ? 'Accepting new patients' : 'Not accepting new patients'}</Badge>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <span className="card__title">My Patients</span>
              <Badge variant="blue">{doctorPatients.length}</Badge>
            </div>
            <div className="card__body stack-list">
              {doctorPatients.length === 0 && (
                <p className="text-muted text-center">No patients assigned yet.</p>
              )}
              {doctorPatients.map((patient) => (
                <div key={patient.id} className="care-row">
                  <div className="care-row__icon">{patient.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <strong>{patient.name}</strong>
                    <span>{patient.condition || 'Awaiting info'} · {patient.progress}% recovery</span>
                  </div>
                  <Badge variant={patient.risk === 'high' ? 'red' : patient.risk === 'moderate' ? 'warn' : 'green'}>
                    {patient.risk}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HPProfile;