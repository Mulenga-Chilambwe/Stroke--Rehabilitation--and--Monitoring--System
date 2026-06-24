// Mock data — offline demo data for patients, caregivers, doctors, exercises, sessions, etc.
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const videoSearch = (exerciseName, bodyPart) =>
  `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
    `stroke rehabilitation physiotherapy ${bodyPart} ${exerciseName} exercise`
  )}`;

const focusAreas = [
  {
    category: 'Upper Limb',
    bodyPart: 'Hand and wrist',
    names: ['Finger taps', 'Wrist circles', 'Towel grip', 'Thumb opposition', 'Table slides'],
    icon: 'H',
  },
  {
    category: 'Shoulder',
    bodyPart: 'Shoulder',
    names: ['Assisted shoulder lift', 'Wall crawl', 'Pendulum swing', 'Scapular squeeze', 'Supported reach'],
    icon: 'S',
  },
  {
    category: 'Lower Limb',
    bodyPart: 'Hip and knee',
    names: ['Seated march', 'Heel slide', 'Knee extension', 'Sit to stand prep', 'Ankle pump'],
    icon: 'L',
  },
  {
    category: 'Balance',
    bodyPart: 'Core and balance',
    names: ['Weight shift', 'Supported stance', 'Heel-to-toe line', 'Side step hold', 'Chair balance'],
    icon: 'B',
  },
  {
    category: 'Speech',
    bodyPart: 'Face and speech',
    names: ['Lip seal drill', 'Tongue sweep', 'Word pacing', 'Breath phrase', 'Smile symmetry'],
    icon: 'Sp',
  },
  {
    category: 'Cognitive',
    bodyPart: 'Memory and attention',
    names: ['Word recall', 'Number sequence', 'Object naming', 'Dual task count', 'Focus scan'],
    icon: 'C',
  },
];

export const EXERCISE_LIBRARY = Array.from({ length: 15 }, (_, index) => {
  const area = focusAreas[index % focusAreas.length];
  const name = area.names[Math.floor(index / focusAreas.length) % area.names.length];
  const level = Math.floor(index / 30) + 1;
  const difficulty = level === 1 ? 'easy' : level === 2 ? 'med' : 'hard';

  return {
    id: `lib-${index + 1}`,
    name: `${name} ${level}.${(index % 10) + 1}`,
    category: area.category,
    bodyPart: area.bodyPart,
    difficulty,
    duration: 2 + (index % 5),
    sets: `${2 + (index % 3)} x ${8 + (index % 7)} reps`,
    freq: index % 4 === 0 ? '3x / week' : 'Daily',
    icon: area.icon,
    videoUrl: videoSearch(name, area.bodyPart),
    videoSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `stroke rehabilitation physiotherapy ${area.bodyPart} ${name} exercise`
    )}`,
    videoProvider: 'youtube',
    safety:
      'Move slowly, breathe normally, and stop if there is sharp pain, dizziness, or unusual weakness.',
    description: `Short guided ${area.bodyPart.toLowerCase()} drill for remote stroke rehabilitation. Designed for controlled practice at home with support nearby.`,
  };
});

export const DEMO_USERS = {
  patient: {
    id: 'u1',
    role: 'patient',
    name: 'Mercy Banda',
    avatar: 'MB',
    color: '#1a7f74',
    email: 'mercy@patient.zm',
    password: 'patient123',
    patientId: 'p1',
    caregiverId: 'c1',
    doctorId: 'd1',
    isAvailable: false,
  },
  caregiver: {
    id: 'u2',
    role: 'caregiver',
    name: 'John Banda',
    avatar: 'JB',
    color: '#d97706',
    email: 'john@caregiver.zm',
    password: 'caregiver123',
    patientId: 'p1',
    caregiverId: 'c1',
    doctorId: 'd1',
    isAvailable: false,
  },
  hp: {
    id: 'u3',
    role: 'hp',
    name: 'Dr. Santhi Kumaran',
    avatar: 'SK',
    color: '#3b5bdb',
    email: 'kumaran@cbu.ac.zm',
    password: 'doctor123',
    doctorId: 'd1',
    isAvailable: true,
  },
};

export const INITIAL_PATIENTS = [
  {
    id: 'p1',
    name: 'Mercy Banda',
    avatar: 'MB',
    age: 62,
    condition: 'Ischemic Stroke',
    admitDate: 'Jan 8, 2026',
    rehabStart: 'Jan 20, 2026',
    progress: 78,
    streak: 8,
    totalSessions: 46,
    targetSessions: 60,
    risk: 'moderate',
    focus: ['Hand and wrist', 'Shoulder', 'Balance'],
    caregiverId: 'c1',
    doctorId: 'd1',
  },
  {
    id: 'p2',
    name: 'Grace Phiri',
    avatar: 'GP',
    age: 55,
    condition: 'Hemorrhagic Stroke',
    admitDate: 'Feb 3, 2026',
    rehabStart: 'Feb 15, 2026',
    progress: 63,
    streak: 4,
    totalSessions: 31,
    targetSessions: 55,
    risk: 'high',
    focus: ['Lower Limb', 'Speech'],
    caregiverId: 'c2',
    doctorId: 'd1',
  },
  {
    id: 'p3',
    name: 'Peter Mwansa',
    avatar: 'PM',
    age: 70,
    condition: 'Transient Ischemic Attack',
    admitDate: 'Mar 11, 2026',
    rehabStart: 'Mar 24, 2026',
    progress: 84,
    streak: 11,
    totalSessions: 54,
    targetSessions: 65,
    risk: 'low',
    focus: ['Balance', 'Cognitive'],
    caregiverId: 'c3',
    doctorId: 'd1',
  },
];

export const INITIAL_CAREGIVERS = [
  { id: 'c1', name: 'John Banda', relation: 'Son', phone: '+260 97X XXX XXX', patientId: 'p1', doctorId: 'd1' },
  { id: 'c2', name: 'Martha Phiri', relation: 'Sister', phone: '+260 96X XXX XXX', patientId: 'p2', doctorId: 'd1' },
  { id: 'c3', name: 'Ruth Mwansa', relation: 'Spouse', phone: '+260 95X XXX XXX', patientId: 'p3', doctorId: 'd1' },
];

export const INITIAL_DOCTORS = [
  {
    id: 'd1',
    name: 'Dr. Santhi Kumaran',
    title: 'Rehabilitation Specialist',
    institution: 'Copperbelt University',
    email: 'kumaran@cbu.ac.zm',
    isAvailable: true,
  },
];

export const INITIAL_ASSIGNMENTS = {
  p1: ['lib-1', 'lib-2', 'lib-4', 'lib-7', 'lib-8', 'lib-12'],
  p2: ['lib-3', 'lib-5', 'lib-9', 'lib-10', 'lib-11'],
  p3: ['lib-4', 'lib-6', 'lib-10', 'lib-12', 'lib-14'],
};

export const INITIAL_SESSIONS = [
  { id: 's1', patientId: 'p1', date: daysAgo(5), exerciseId: 'lib-1', exercise: 'Finger taps 1.1', duration: 14, completed: true, pain: 1, notes: 'Better finger separation.', loggedBy: 'patient' },
  { id: 's2', patientId: 'p1', date: daysAgo(4), exerciseId: 'lib-7', exercise: 'Wrist circles 1.2', duration: 12, completed: true, pain: 0, notes: 'No discomfort.', loggedBy: 'patient' },
  { id: 's3', patientId: 'p1', date: daysAgo(3), exerciseId: 'lib-14', exercise: 'Table slides 1.3', duration: 18, completed: true, pain: 2, notes: 'Mild shoulder pulling.', loggedBy: 'caregiver' },
  { id: 's4', patientId: 'p1', date: daysAgo(2), exerciseId: 'lib-8', exercise: 'Wall crawl 1.8', duration: 16, completed: true, pain: 2, notes: 'Completed with support.', loggedBy: 'patient' },
  { id: 's5', patientId: 'p1', date: daysAgo(1), exerciseId: 'lib-12', exercise: 'Number sequence 1.2', duration: 15, completed: false, pain: 0, notes: 'Skipped due to fatigue.', loggedBy: 'caregiver' },
  { id: 's6', patientId: 'p2', date: daysAgo(1), exerciseId: 'lib-15', exercise: 'Heel slide 1.3', duration: 10, completed: true, pain: 3, notes: 'Knee stiffness reported.', loggedBy: 'caregiver' },
  { id: 's7', patientId: 'p3', date: daysAgo(1), exerciseId: 'lib-22', exercise: 'Supported stance 1.4', duration: 20, completed: true, pain: 0, notes: 'Strong balance today.', loggedBy: 'patient' },
];

export const INITIAL_MESSAGES = [
  { id: 'm1', patientId: 'p1', from: 'hp', to: 'patient', fromName: 'Dr. Kumaran', text: 'Mercy, your hand control is improving. Keep today gentle and controlled.', time: '2h ago', read: false },
  { id: 'm2', patientId: 'p1', from: 'caregiver', to: 'hp', fromName: 'John Banda', text: 'Mercy had mild shoulder pain after assisted lifts. Should I reduce the reps?', time: '1h ago', read: false },
  { id: 'm3', patientId: 'p1', from: 'hp', to: 'caregiver', fromName: 'Dr. Kumaran', text: 'Yes, reduce to one set today and log pain after the session.', time: '45m ago', read: true },
  { id: 'm4', patientId: 'p2', from: 'hp', to: 'caregiver', fromName: 'Dr. Kumaran', text: 'Please capture Grace\u2019s blood pressure before the afternoon session.', time: '3h ago', read: false },
];

export const INITIAL_VITALS = {
  p1: { heartRate: 74, bp: '122/80', temp: 36.6, oxygenSat: 98, weight: 68, mood: 'Steady', sleep: 7, lastUpdated: 'Today 9:00 AM', loggedBy: 'John Banda' },
  p2: { heartRate: 88, bp: '138/86', temp: 36.9, oxygenSat: 96, weight: 72, mood: 'Tired', sleep: 5, lastUpdated: 'Today 8:10 AM', loggedBy: 'Martha Phiri' },
  p3: { heartRate: 70, bp: '118/76', temp: 36.4, oxygenSat: 99, weight: 75, mood: 'Positive', sleep: 8, lastUpdated: 'Yesterday 7:40 PM', loggedBy: 'Ruth Mwansa' },
};

export const INITIAL_VITAL_HISTORY = [
  { id: 'v1', patientId: 'p1', date: daysAgo(2), bp: '124/82', heartRate: 76, oxygenSat: 98, temp: 36.5, mood: 'Calm', loggedBy: 'John Banda' },
  { id: 'v2', patientId: 'p1', date: daysAgo(1), bp: '122/80', heartRate: 74, oxygenSat: 98, temp: 36.6, mood: 'Steady', loggedBy: 'John Banda' },
  { id: 'v3', patientId: 'p2', date: daysAgo(1), bp: '138/86', heartRate: 88, oxygenSat: 96, temp: 36.9, mood: 'Tired', loggedBy: 'Martha Phiri' },
];

export const INITIAL_MEDICATIONS = {
  p1: [
    { id: 'med1', name: 'Aspirin', dose: '81 mg', schedule: 'Morning', takenToday: true },
    { id: 'med2', name: 'Atorvastatin', dose: '20 mg', schedule: 'Night', takenToday: false },
  ],
  p2: [
    { id: 'med3', name: 'Amlodipine', dose: '5 mg', schedule: 'Morning', takenToday: true },
  ],
  p3: [
    { id: 'med4', name: 'Clopidogrel', dose: '75 mg', schedule: 'Morning', takenToday: true },
  ],
};

export const INITIAL_ALERTS = [
  { id: 'a1', patientId: 'p1', type: 'warning', msg: 'Mercy missed a hand-control session yesterday. Caregiver notified.', time: '1d ago', read: false },
  { id: 'a2', patientId: 'p1', type: 'info', msg: 'Weekly progress report is ready for clinical review.', time: '2d ago', read: false },
  { id: 'a3', patientId: 'p2', type: 'warning', msg: 'Grace reported pain 3/5 during lower limb work.', time: '1d ago', read: false },
];

export const INITIAL_RECORDINGS = [
  {
    id: 'rec-1',
    doctorId: 'd1',
    patientId: 'p1',
    exerciseId: 'lib-1',
    title: 'Personalised Finger Tap Guide',
    description: 'A close-up demonstration of proper finger tap form with pacing cues tailored to Mercy\'s current recovery stage.',
    notes: 'Focus on full separation between each finger. Rest 30s between sets. Slow and controlled.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    fileName: 'finger-tap-demo.mp4',
    uploadedAt: daysAgo(2),
    duration: 4,
    views: 3,
  },
  {
    id: 'rec-2',
    doctorId: 'd1',
    patientId: 'p1',
    exerciseId: null,
    title: 'Upper Limb Strengthening Routine',
    description: 'A full guided routine combining wrist circles, towel grip, and supported reaches.',
    notes: 'Try to complete the full circuit once. Stop if you feel any shoulder strain.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    fileName: 'upper-limb-routine.mp4',
    uploadedAt: daysAgo(5),
    duration: 12,
    views: 7,
  },
  {
    id: 'rec-3',
    doctorId: 'd1',
    patientId: 'p2',
    exerciseId: 'lib-3',
    title: 'Heel Slide Technique Demonstration',
    description: 'Guided heel slide for post-stroke lower limb recovery with positioning tips.',
    notes: 'Use a towel under the heel if the bed surface is too sticky. Keep the knee aligned.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    fileName: 'heel-slide-guide.mp4',
    uploadedAt: daysAgo(1),
    duration: 6,
    views: 1,
  },
  {
    id: 'rec-4',
    doctorId: 'd1',
    patientId: 'p3',
    exerciseId: 'lib-22',
    title: 'Balance Drills for Home Practice',
    description: 'Three supported balance exercises progressing from weight shift to single-leg stance.',
    notes: 'Keep a sturdy chair nearby. Only attempt single-leg if weight shift feels comfortable.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    fileName: 'balance-drills.mp4',
    uploadedAt: daysAgo(3),
    duration: 8,
    views: 2,
  },
  {
    id: 'rec-5',
    doctorId: 'd1',
    patientId: 'p1',
    exerciseId: 'lib-7',
    title: 'Wrist Mobility Check-in',
    description: 'Dr. Kumaran checks in with a guided wrist circle and thumb opposition session, with modifications based on Mercy\'s last pain report.',
    notes: 'If wrist feels stiff, start with smaller circles and gradually increase range.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    fileName: 'wrist-mobility.mp4',
    uploadedAt: daysAgo(0),
    duration: 5,
    views: 0,
  },
];

export const INITIAL_NEXT_SESSION = {
  p1: { date: 'Today, 3:00 PM', exerciseId: 'lib-8', exercise: 'Wall crawl 1.8', reminder: true },
  p2: { date: 'Today, 4:30 PM', exerciseId: 'lib-15', exercise: 'Heel slide 1.3', reminder: true },
  p3: { date: 'Tomorrow, 9:00 AM', exerciseId: 'lib-22', exercise: 'Supported stance 1.4', reminder: true },
};

export const INITIAL_PATIENT_PROFILE = INITIAL_PATIENTS[0];
export const INITIAL_CAREGIVER_PROFILE = INITIAL_CAREGIVERS[0];
export const INITIAL_HP_PROFILE = INITIAL_DOCTORS[0];
export const INITIAL_EXERCISE_PLAN = EXERCISE_LIBRARY.filter((exercise) =>
  INITIAL_ASSIGNMENTS.p1.includes(exercise.id)
);
