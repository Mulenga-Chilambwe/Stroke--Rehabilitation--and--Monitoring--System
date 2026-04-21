/**
 * data/mockData.js
 * ─────────────────────────────────────────────────────────────
 * Centralised seed data used as the initial state of the
 * shared store.  In a production app this would be replaced
 * by API calls.
 *
 * Fix: session dates are now computed dynamically relative to
 * today so the dashboard always shows current data.
 * ─────────────────────────────────────────────────────────────
 */

// Helper: returns a date string N days ago from today
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const TODAY = daysAgo(0);

/** ── Demo users (one per role) ── */
export const DEMO_USERS = {
  patient: {
    id: 'u1',
    role: 'patient',
    name: 'Mercy Banda',
    avatar: 'MB',
    color: '#1a7f74',
    email: 'mercy@patient.zm',
    password: 'patient123',
  },
  caregiver: {
    id: 'u2',
    role: 'caregiver',
    name: 'John Banda',
    avatar: 'JB',
    color: '#d97706',
    email: 'john@caregiver.zm',
    password: 'caregiver123',
  },
  hp: {
    id: 'u3',
    role: 'hp',
    name: 'Dr. Santhi Kumaran',
    avatar: 'SK',
    color: '#3b5bdb',
    email: 'kumaran@cbu.ac.zm',
    password: 'doctor123',
  },
};

/** ── Patient profile ── */
export const INITIAL_PATIENT_PROFILE = {
  name: 'Mercy Banda',
  age: 62,
  condition: 'Ischemic Stroke',
  admitDate: 'Jan 8, 2025',
  progress: 78,
  streak: 5,
  totalSessions: 14,
  targetSessions: 20,
};

/** ── Caregiver profile ── */
export const INITIAL_CAREGIVER_PROFILE = {
  name: 'John Banda',
  relation: 'Son',
  phone: '+260 97X XXX XXX',
};

/** ── Health-professional profile ── */
export const INITIAL_HP_PROFILE = {
  name: 'Dr. Santhi Kumaran',
  title: 'Rehabilitation Specialist',
  institution: 'Copperbelt University',
};

/** ── Assigned exercise plan ── */
export const INITIAL_EXERCISE_PLAN = [
  {
    id: 'e1',
    name: 'Hand Grip Strengthening',
    emoji: '✋',
    sets: '3 × 10 reps',
    freq: 'Daily',
    category: 'Upper Limb',
    difficulty: 'easy',
    assignedBy: 'Dr. Kumaran',
    description:
      'Squeeze a soft ball or rolled towel firmly, hold for 3 seconds, then release. Focuses on rebuilding grip strength and hand dexterity.',
  },
  {
    id: 'e2',
    name: 'Seated Leg Raises',
    emoji: '🦵',
    sets: '3 × 10 reps',
    freq: 'Daily',
    category: 'Lower Limb',
    difficulty: 'easy',
    assignedBy: 'Dr. Kumaran',
    description:
      'Sit upright, slowly raise each leg to hip height, hold 2 seconds, lower. Strengthens hip flexors and quadriceps without standing.',
  },
  {
    id: 'e3',
    name: 'Shoulder Range of Motion',
    emoji: '🔄',
    sets: '2 × 12 reps',
    freq: '3x / week',
    category: 'Upper Limb',
    difficulty: 'med',
    assignedBy: 'Dr. Kumaran',
    description:
      'Gentle forward, backward and circular shoulder movements to restore full joint mobility and reduce stiffness.',
  },
  {
    id: 'e4',
    name: 'Balance & Standing Practice',
    emoji: '⚖️',
    sets: '5 × 30 s hold',
    freq: '2x / week',
    category: 'Balance',
    difficulty: 'hard',
    assignedBy: 'Dr. Kumaran',
    description:
      'Single-leg stands and heel-to-toe walking to rebuild postural control. Always performed near a wall or with caregiver present.',
  },
  {
    id: 'e5',
    name: 'Cognitive Memory Tasks',
    emoji: '🧠',
    sets: 'Daily session',
    freq: 'Daily',
    category: 'Cognitive',
    difficulty: 'med',
    assignedBy: 'Dr. Kumaran',
    description:
      'Word recall exercises, number sequences and attention-focusing activities to support cognitive rehabilitation.',
  },
];

/**
 * ── Session log ──
 * Dates are relative to TODAY so the dashboard always has
 * "recent" data no matter when the app is opened.
 */
export const INITIAL_SESSIONS = [
  {
    id: 's1',
    date: daysAgo(2),
    exercise: 'Hand Grip Strengthening',
    duration: 15,
    completed: true,
    pain: 2,
    notes: 'Felt mild fatigue in right hand.',
    loggedBy: 'patient',
  },
  {
    id: 's2',
    date: daysAgo(1),
    exercise: 'Seated Leg Raises',
    duration: 20,
    completed: true,
    pain: 1,
    notes: 'Good session, improving.',
    loggedBy: 'patient',
  },
  {
    id: 's3',
    date: daysAgo(1),
    exercise: 'Shoulder Range of Motion',
    duration: 18,
    completed: false,
    pain: 0,
    notes: '',
    loggedBy: null,
  },
];

/** ── Chat messages ── */
export const INITIAL_MESSAGES = [
  {
    id: 'm1',
    from: 'hp',
    to: 'patient',
    fromName: 'Dr. Kumaran',
    text: "Great progress this week, Mercy! Keep up the daily hand exercises.",
    time: '2h ago',
    read: false,
  },
  {
    id: 'm2',
    from: 'caregiver',
    to: 'hp',
    fromName: 'John Banda',
    text: "Mercy complained of shoulder pain after yesterday's session. Should we pause?",
    time: '1h ago',
    read: false,
  },
  {
    id: 'm3',
    from: 'hp',
    to: 'caregiver',
    fromName: 'Dr. Kumaran',
    text: 'Please reduce shoulder exercises to 5 reps for today. Monitor and report back.',
    time: '45m ago',
    read: true,
  },
];

/** ── Patient vitals ── */
export const INITIAL_VITALS = {
  heartRate: 74,
  bp: '122/80',
  temp: 36.6,
  oxygenSat: 98,
  weight: 68,
  lastUpdated: 'Today 9:00 AM',
};

/** ── System alerts ── */
export const INITIAL_ALERTS = [
  {
    id: 'a1',
    type: 'warning',
    msg: 'Mercy missed her Shoulder Range of Motion exercise yesterday. Caregiver notified.',
    time: '1d ago',
    read: false,
  },
  {
    id: 'a2',
    type: 'info',
    msg: 'Weekly progress report is ready for review.',
    time: '2d ago',
    read: false,
  },
];

/** ── Next scheduled session ── */
export const INITIAL_NEXT_SESSION = {
  date: 'Today, 3:00 PM',
  exercise: 'Balance & Standing Practice',
  reminder: true,
};
