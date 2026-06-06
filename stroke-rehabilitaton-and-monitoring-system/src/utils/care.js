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

export const todayKey = () => new Date().toISOString().split('T')[0];

export const difficultyVariant = (difficulty) =>
  difficulty === 'easy' ? 'green' : difficulty === 'med' ? 'warn' : 'red';

export const riskVariant = (risk) =>
  risk === 'low' ? 'green' : risk === 'moderate' ? 'warn' : 'red';
