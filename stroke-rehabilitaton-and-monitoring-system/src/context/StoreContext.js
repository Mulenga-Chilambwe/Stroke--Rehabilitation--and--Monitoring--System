/**
 * context/StoreContext.js
 * ─────────────────────────────────────────────────────────────
 * Global shared-state store.
 *
 * Architecture:
 *   • A plain JS pub/sub object (`store`) holds application state.
 *   • React components subscribe via the `useStore` hook.
 *   • Any role (patient / caregiver / hp) that calls `dispatch`
 *     updates the single source of truth, and every subscribed
 *     component re-renders – simulating real-time sync.
 *
 * In production, replace `store` with a WebSocket or
 * REST-polling layer that pushes server state into the same
 * shape of object.
 * ─────────────────────────────────────────────────────────────
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  INITIAL_PATIENT_PROFILE,
  INITIAL_CAREGIVER_PROFILE,
  INITIAL_HP_PROFILE,
  INITIAL_EXERCISE_PLAN,
  INITIAL_SESSIONS,
  INITIAL_MESSAGES,
  INITIAL_VITALS,
  INITIAL_ALERTS,
  INITIAL_NEXT_SESSION,
} from '../data/mockData';

// ─── Build the initial store state ───────────────────────────
const buildInitialState = () => ({
  patientProfile:   { ...INITIAL_PATIENT_PROFILE },
  caregiverProfile: { ...INITIAL_CAREGIVER_PROFILE },
  hpProfile:        { ...INITIAL_HP_PROFILE },
  exercisePlan:     [...INITIAL_EXERCISE_PLAN],
  sessions:         [...INITIAL_SESSIONS],
  messages:         [...INITIAL_MESSAGES],
  vitals:           { ...INITIAL_VITALS },
  alerts:           [...INITIAL_ALERTS],
  nextSession:      { ...INITIAL_NEXT_SESSION },
});

// ─── Create the raw pub/sub store ────────────────────────────
/**
 * createStore()
 * A minimal pub/sub state container that lives outside React.
 * This means updates are NOT batched by React but DO trigger
 * re-renders in every subscribed component.
 */
const createStore = () => {
  let state = buildInitialState();
  let listeners = [];

  return {
    /** Return current state snapshot. */
    getState: () => state,

    /**
     * Update state with an updater function:
     *   dispatch(s => ({ ...s, sessions: [...s.sessions, newSession] }))
     */
    setState: (updater) => {
      state = { ...state, ...updater(state) };
      // Notify all subscribers
      listeners.forEach((fn) => fn(state));
    },

    /**
     * Subscribe to state changes.
     * Returns an unsubscribe function.
     */
    subscribe: (fn) => {
      listeners.push(fn);
      return () => {
        listeners = listeners.filter((l) => l !== fn);
      };
    },
  };
};

// Singleton store instance (shared across all portals in the same browser tab)
const store = createStore();

// React context that provides the store to the component tree
export const StoreContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────
/**
 * StoreProvider
 * Wrap the entire app with this so every portal can access
 * the shared store via `useStore()`.
 */
export const StoreProvider = ({ children }) => (
  <StoreContext.Provider value={store}>
    {children}
  </StoreContext.Provider>
);

// ─── Hook ────────────────────────────────────────────────────
/**
 * useStore()
 * Returns [state, dispatch] – analogous to useState / useReducer
 * but backed by the global pub/sub store.
 *
 * Usage:
 *   const [state, dispatch] = useStore();
 *   dispatch(s => ({ ...s, vitals: newVitals }));
 */
export const useStore = () => {
  const storeInstance = useContext(StoreContext);

  if (!storeInstance) {
    throw new Error('useStore must be used inside <StoreProvider>');
  }

  // Local React state mirrors the store state
  const [state, setState] = useState(storeInstance.getState());

  useEffect(() => {
    // Subscribe and return the cleanup function
    const unsubscribe = storeInstance.subscribe(setState);
    return unsubscribe;
  }, [storeInstance]);

  // Stable dispatch reference
  const dispatch = useCallback(
    (updater) => storeInstance.setState(updater),
    [storeInstance]
  );

  return [state, dispatch];
};
