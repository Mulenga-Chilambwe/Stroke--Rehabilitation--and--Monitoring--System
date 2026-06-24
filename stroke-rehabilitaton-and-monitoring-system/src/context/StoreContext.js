/**
 * context/StoreContext.js
 * ─────────────────────────────────────────────────────────────
 * Global application state management store.
 * Provides `useStore()` hook that returns [state, dispatch, ctx]
 * where ctx has sync* methods for backend persistence.
 * Falls back to mock data when the backend is unavailable.
 * ─────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import {
  EXERCISE_LIBRARY,
  INITIAL_PATIENTS,
  INITIAL_CAREGIVERS,
  INITIAL_DOCTORS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SESSIONS,
  INITIAL_MESSAGES,
  INITIAL_VITALS,
  INITIAL_VITAL_HISTORY,
  INITIAL_MEDICATIONS,
  INITIAL_ALERTS,
  INITIAL_RECORDINGS,
  INITIAL_NEXT_SESSION,
} from '../data/mockData';

import {
  apiGetExercises,
  apiGetSessions,
  apiCreateSession,
  apiGetVitals,
  apiCreateVital,
  apiGetRecordings,
  apiCreateRecording,
  apiGetMessages,
  apiSendMessage,
  apiGetAlerts,
  apiCreateAlert,
  apiGetMedications,
  apiCreateMedication,
  apiGetPatients,
} from '../services/api';

const buildInitialState = () => ({
  exerciseLibrary:  [...EXERCISE_LIBRARY],
  patients:         [...INITIAL_PATIENTS],
  caregivers:       [...INITIAL_CAREGIVERS],
  doctors:          [...INITIAL_DOCTORS],
  assignments:      { ...INITIAL_ASSIGNMENTS },
  patientProfile:   { ...INITIAL_PATIENTS[0] },
  caregiverProfile: { ...INITIAL_CAREGIVERS[0] },
  hpProfile:        { ...INITIAL_DOCTORS[0] },
  exercisePlan:     EXERCISE_LIBRARY.filter((ex) =>
    INITIAL_ASSIGNMENTS.p1?.includes(ex.id)
  ),
  sessions:         [...INITIAL_SESSIONS],
  messages:         [...INITIAL_MESSAGES],
  vitals:           { ...INITIAL_VITALS },
  vitalHistory:     [...INITIAL_VITAL_HISTORY],
  medications:      { ...INITIAL_MEDICATIONS },
  alerts:           [...INITIAL_ALERTS],
  recordings:       [...INITIAL_RECORDINGS],
  nextSession:      { ...INITIAL_NEXT_SESSION },
  loading:          true,
  syncError:        null,
});

const createStore = () => {
  let state = buildInitialState();
  let listeners = [];
  return {
    getState: () => state,
    setState: (updater) => {
      state = { ...state, ...updater(state) };
      listeners.forEach((fn) => fn(state));
    },
    subscribe: (fn) => {
      listeners.push(fn);
      return () => {
        listeners = listeners.filter((l) => l !== fn);
      };
    },
    reset: () => {
      state = buildInitialState();
      listeners.forEach((fn) => fn(state));
    },
  };
};

const store = createStore();

export const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem('strokeRehabToken');
      if (!token || token === 'demo-offline-token') {
        store.setState(() => ({ ...buildInitialState(), loading: false }));
        return;
      }

      const [exercises] = await Promise.all([
        apiGetExercises().catch(() => null),
      ]);

      let data = { loading: false };

      if (exercises && exercises.length > 0) {
        data.exerciseLibrary = exercises;
        const patients = await apiGetPatients().catch(() => null);
        if (patients) data.patients = patients;
      }

      store.setState(() => data);
    } catch (err) {
      console.warn('Backend unavailable, using local data:', err.message);
      store.setState(() => ({ loading: false }));
    }
  };

  const refreshPatientData = useCallback(async (patientId) => {
    try {
      const token = localStorage.getItem('strokeRehabToken');
      if (!token || token === 'demo-offline-token') return;

      const [sessions, vitalsArr, recordings, messages, alerts, medications] = await Promise.all([
        apiGetSessions(patientId).catch(() => null),
        apiGetVitals(patientId).catch(() => null),
        apiGetRecordings({ patientId }).catch(() => null),
        apiGetMessages(patientId).catch(() => null),
        apiGetAlerts(patientId).catch(() => null),
        apiGetMedications(patientId).catch(() => null),
      ]);

      const updates = {};
      if (sessions) {
        updates.sessions = sessions;
        const completed = sessions.filter((s) => s.completed).length;
        updates.sessionCounts = { [patientId]: { completed, total: sessions.length } };
      }
      if (vitalsArr) {
        const latest = vitalsArr.reduce((a, b) => new Date(a.date || 0) > new Date(b.date || 0) ? a : b, vitalsArr[0]);
        updates.vitals = { ...store.getState().vitals, [patientId]: latest || {} };
        updates.vitalHistory = vitalsArr;
      }
      if (recordings) updates.recordings = recordings;
      if (messages) updates.messages = messages;
      if (alerts) updates.alerts = alerts;
      if (medications) updates.medications = { ...store.getState().medications, [patientId]: medications };

      store.setState(() => updates);
    } catch (err) {
      console.warn('Refresh failed:', err.message);
    }
  }, []);

  const syncSession = useCallback(async (session) => {
    try {
      const token = localStorage.getItem('strokeRehabToken');
      if (token && token !== 'demo-offline-token') {
        await apiCreateSession(session);
      }
    } catch (err) {
      console.warn('Session sync failed:', err.message);
    }
  }, []);

  const syncVital = useCallback(async (vital) => {
    try {
      const token = localStorage.getItem('strokeRehabToken');
      if (token && token !== 'demo-offline-token') {
        await apiCreateVital(vital);
      }
    } catch (err) {
      console.warn('Vital sync failed:', err.message);
    }
  }, []);

  const syncRecording = useCallback(async (recording) => {
    try {
      const token = localStorage.getItem('strokeRehabToken');
      if (token && token !== 'demo-offline-token') {
        await apiCreateRecording(recording);
      }
    } catch (err) {
      console.warn('Recording sync failed:', err.message);
    }
  }, []);

  const syncMessage = useCallback(async (msg) => {
    try {
      const token = localStorage.getItem('strokeRehabToken');
      if (token && token !== 'demo-offline-token') {
        await apiSendMessage(msg);
      }
    } catch (err) {
      console.warn('Message sync failed:', err.message);
    }
  }, []);

  const syncAlert = useCallback(async (alert) => {
    try {
      const token = localStorage.getItem('strokeRehabToken');
      if (token && token !== 'demo-offline-token') {
        await apiCreateAlert(alert);
      }
    } catch (err) {
      console.warn('Alert sync failed:', err.message);
    }
  }, []);

  const syncMedication = useCallback(async (med) => {
    try {
      const token = localStorage.getItem('strokeRehabToken');
      if (token && token !== 'demo-offline-token') {
        await apiCreateMedication(med);
      }
    } catch (err) {
      console.warn('Medication sync failed:', err.message);
    }
  }, []);

  const dispatch = useCallback(
    (updater) => store.setState(updater),
    []
  );

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        refreshPatientData,
        syncSession,
        syncVital,
        syncRecording,
        syncMessage,
        syncAlert,
        syncMedication,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return [ctx.state, ctx.dispatch, ctx];
};
