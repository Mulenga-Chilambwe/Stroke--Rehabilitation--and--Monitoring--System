export const getPatientIdForUser = (user) => {
  if (user?.patientId) return user.patientId;
  return '';
};

export const getDoctorIdForUser = (user) => user?.doctorId || '';

export const getPatient = (state, patientId = 'p1') =>
  state.patients.find((patient) => patient.id === patientId) || state.patients[0];

export const getCaregiverForPatient = (state, patientId = 'p1') =>
  state.caregivers.find((caregiver) => caregiver.patientId === patientId) || state.caregivers[0];

export const getDoctorForPatient = (state, patientId = 'p1') => {
  const patient = getPatient(state, patientId);
  return state.doctors.find((doctor) => doctor.id === patient.doctorId) || state.doctors[0];
};

export const getAssignedExercises = (state, patientId = 'p1') => {
  const assignedIds = state.assignments[patientId] || [];
  return assignedIds
    .map((id) => state.exerciseLibrary.find((exercise) => exercise.id === id))
    .filter(Boolean);
};

export const getPatientSessions = (state, patientId = 'p1') =>
  state.sessions.filter((session) => session.patientId === patientId);

export const getPatientRecordings = (state, patientId) =>
  state.recordings.filter((rec) => rec.patientId === patientId);

export const getDoctorRecordings = (state, doctorId) =>
  state.recordings.filter((rec) => rec.doctorId === doctorId);

export const getPatientVitals = (state, patientId) =>
  state.vitalHistory.filter((v) => v.patientId === patientId);

export const getPatientAlerts = (state, patientId) =>
  state.alerts.filter((a) => a.patientId === patientId);

export const getPatientMedications = (state, patientId) =>
  state.medications[patientId] || [];

export const todayKey = () => new Date().toISOString().split('T')[0];

export const difficultyVariant = (difficulty) =>
  difficulty === 'easy' ? 'green' : difficulty === 'med' ? 'warn' : 'red';

export const riskVariant = (risk) =>
  risk === 'low' ? 'green' : risk === 'moderate' ? 'warn' : 'red';

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

export const calculateProgress = (sessions, targetSessions) => {
  const completed = sessions.filter((s) => s.completed).length;
  return Math.min(100, Math.round((completed / Math.max(targetSessions, 1)) * 100));
};

export const calculateStreak = (sessions) => {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hasSession = sessions.some((s) => s.date === dateStr && s.completed);
    if (hasSession) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
};
