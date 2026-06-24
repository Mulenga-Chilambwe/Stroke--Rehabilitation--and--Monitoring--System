// API service layer — all backend HTTP calls with auth headers and error handling
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('strokeRehabToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || `HTTP error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

// Auth
export const apiLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiLogin error:', error);
    throw error;
  }
};

export const apiRegister = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiRegister error:', error);
    throw error;
  }
};

export const apiGetAvailableDoctors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/doctors/available`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetAvailableDoctors error:', error);
    throw error;
  }
};

export const apiUpdateAvailability = async (email, isAvailable) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/doctors/availability`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, isAvailable }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiUpdateAvailability error:', error);
    throw error;
  }
};

// Exercises
export const apiGetExercises = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/exercises`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetExercises error:', error);
    throw error;
  }
};

export const apiGetExercise = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exercises/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetExercise error:', error);
    throw error;
  }
};

// Sessions
export const apiGetSessions = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions?patientId=${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetSessions error:', error);
    throw error;
  }
};

export const apiCreateSession = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiCreateSession error:', error);
    throw error;
  }
};

export const apiUpdateSession = async (id, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiUpdateSession error:', error);
    throw error;
  }
};

export const apiDeleteSession = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiDeleteSession error:', error);
    throw error;
  }
};

// Vitals
export const apiGetVitals = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vitals?patientId=${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetVitals error:', error);
    throw error;
  }
};

export const apiCreateVital = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vitals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiCreateVital error:', error);
    throw error;
  }
};

export const apiGetLatestVital = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vitals/latest/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetLatestVital error:', error);
    throw error;
  }
};

// Recordings
export const apiGetRecordings = async (params) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/recordings?${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetRecordings error:', error);
    throw error;
  }
};

export const apiCreateRecording = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recordings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiCreateRecording error:', error);
    throw error;
  }
};

export const apiDeleteRecording = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recordings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiDeleteRecording error:', error);
    throw error;
  }
};

export const apiIncrementViews = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recordings/${id}/view`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiIncrementViews error:', error);
    throw error;
  }
};

// Messages
export const apiGetMessages = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages?patientId=${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetMessages error:', error);
    throw error;
  }
};

export const apiSendMessage = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiSendMessage error:', error);
    throw error;
  }
};

export const apiMarkMessagesRead = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiMarkMessagesRead error:', error);
    throw error;
  }
};

// Alerts
export const apiGetAlerts = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts?patientId=${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetAlerts error:', error);
    throw error;
  }
};

export const apiCreateAlert = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiCreateAlert error:', error);
    throw error;
  }
};

export const apiMarkAlertRead = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/read/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiMarkAlertRead error:', error);
    throw error;
  }
};

// Medications
export const apiGetMedications = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medications?patientId=${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetMedications error:', error);
    throw error;
  }
};

export const apiCreateMedication = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiCreateMedication error:', error);
    throw error;
  }
};

export const apiToggleMedication = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medications/${id}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiToggleMedication error:', error);
    throw error;
  }
};

// Patients
export const apiGetPatients = async (doctorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients?doctorId=${doctorId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetPatients error:', error);
    throw error;
  }
};

export const apiGetPatientProfile = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiGetPatientProfile error:', error);
    throw error;
  }
};

export const apiUpdatePatientProgress = async (patientId, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('apiUpdatePatientProgress error:', error);
    throw error;
  }
};
