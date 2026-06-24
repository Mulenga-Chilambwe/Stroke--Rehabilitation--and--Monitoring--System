// Seed demo data — populates exercises, patients, sessions, vitals, recordings, messages, alerts, medications
const User = require("./models/User");
const Patient = require("./models/Patient");
const Exercise = require("./models/Exercise");
const Session = require("./models/Session");
const Vital = require("./models/Vital");
const Recording = require("./models/Recording");
const Message = require("./models/Message");
const Alert = require("./models/Alert");
const Medication = require("./models/Medication");

const exercises = [
  { exerciseId: 'lib-1', name: 'Finger taps 1.1', category: 'Upper Limb', bodyPart: 'Hand and wrist', difficulty: 'easy', duration: 5, sets: '2 x 10 reps', freq: 'Daily', icon: 'H', videoUrl: 'https://www.youtube.com/embed?listType=search&list=finger%20taps%20exercise', safety: 'Move slowly, stop if pain.', description: 'Finger tapping exercise.' },
  { exerciseId: 'lib-2', name: 'Shoulder Flexion Stretch', category: 'Upper Limb', bodyPart: 'Shoulder', difficulty: 'easy', duration: 8, sets: '3 x 30 sec', freq: 'Daily', icon: 'S', videoUrl: 'https://www.youtube.com/embed?listType=search&list=shoulder%20flexion%20stretch', safety: 'Do not overextend.', description: 'Gentle shoulder flexion stretch.' },
  { exerciseId: 'lib-3', name: 'Ankle Pumps', category: 'Lower Limb', bodyPart: 'Ankle', difficulty: 'easy', duration: 5, sets: '2 x 20 reps', freq: 'Daily', icon: 'A', videoUrl: 'https://www.youtube.com/embed?listType=search&list=ankle%20pumps%20exercise', safety: 'Keep movements controlled.', description: 'Ankle pumping motion to improve circulation.' },
  { exerciseId: 'lib-4', name: 'Knee Extension', category: 'Lower Limb', bodyPart: 'Knee', difficulty: 'med', duration: 10, sets: '3 x 12 reps', freq: 'Daily', icon: 'K', videoUrl: 'https://www.youtube.com/embed?listType=search&list=knee%20extension%20exercise', safety: 'Use support if needed.', description: 'Seated knee extension exercise.' },
  { exerciseId: 'lib-5', name: 'Tongue Lateralisation', category: 'Speech', bodyPart: 'Tongue', difficulty: 'easy', duration: 3, sets: '2 x 15 reps', freq: 'Daily', icon: 'T', videoUrl: 'https://www.youtube.com/embed?listType=search&list=tongue%20exercise%20speech', safety: 'Rest between sets.', description: 'Lateral tongue movement for speech.' },
  { exerciseId: 'lib-6', name: 'Standing March', category: 'Balance', bodyPart: 'Legs', difficulty: 'med', duration: 8, sets: '3 x 10 reps', freq: 'Daily', icon: 'M', videoUrl: 'https://www.youtube.com/embed?listType=search&list=standing%20march%20exercise', safety: 'Hold onto a stable surface.', description: 'Standing march to improve balance.' },
  { exerciseId: 'lib-7', name: 'Memory Card Match', category: 'Cognitive', bodyPart: 'Mental', difficulty: 'med', duration: 10, sets: '1 x 5 min', freq: 'Weekly', icon: 'C', videoUrl: 'https://www.youtube.com/embed?listType=search&list=memory%20exercise%20cognitive', safety: 'Take breaks if fatigued.', description: 'Cognitive memory matching exercise.' },
];

const seedDemoData = async () => {
  const exerciseExists = await Exercise.findOne({});
  if (exerciseExists) {
    console.log("Demo data already exists, skipping");
    return;
  }

  const users = await User.find({});
  if (!users.length) {
    console.log("No users found, skipping demo data");
    return;
  }

  const getUserByEmail = (email) => users.find((u) => u.email === email.toLowerCase());
  const mercy = getUserByEmail("mercy@patient.zm");
  const kumaran = getUserByEmail("kumaran@cbu.ac.zm");
  const john = getUserByEmail("john@caregiver.zm");

  const patientDocs = [];
  const patients = [
    { userId: mercy?._id, patientId: 'p1', name: 'Mercy Banda', avatar: 'MB', age: 45, condition: 'Ischemic Stroke', admitDate: '2026-01-10', rehabStart: '2026-01-12', progress: 60, streak: 7, totalSessions: 12, targetSessions: 30, risk: 'moderate', focus: ['Upper Limb', 'Speech'], caregiverId: 'c1', doctorId: 'd1' },
    { userId: null, patientId: 'p2', name: 'Chanda Mwila', avatar: 'CM', age: 38, condition: 'Hemorrhagic Stroke', admitDate: '2026-02-20', rehabStart: '2026-02-22', progress: 35, streak: 3, totalSessions: 6, targetSessions: 30, risk: 'high', focus: ['Lower Limb', 'Balance'], caregiverId: 'c2', doctorId: 'd1' },
    { userId: null, patientId: 'p3', name: 'Bwalya Tembo', avatar: 'BT', age: 52, condition: 'Transient Ischemic Attack', admitDate: '2026-03-05', rehabStart: '2026-03-07', progress: 80, streak: 14, totalSessions: 20, targetSessions: 30, risk: 'low', focus: ['Cognitive', 'Upper Limb'], caregiverId: 'c3', doctorId: 'd1' },
  ];

  for (const p of patients) {
    const existing = await Patient.findOne({ patientId: p.patientId });
    if (!existing) {
      patientDocs.push(await Patient.create(p));
    }
  }

  for (const ex of exercises) {
    const existing = await Exercise.findOne({ exerciseId: ex.exerciseId });
    if (!existing) {
      await Exercise.create(ex);
    }
  }

  const sessions = [
    { sessionId: 's1', patientId: 'p1', exerciseId: 'lib-1', exercise: 'Finger taps 1.1', date: '2026-06-15', duration: 5, completed: true, pain: 1, notes: 'Good session', loggedBy: 'c1' },
    { sessionId: 's2', patientId: 'p1', exerciseId: 'lib-2', exercise: 'Shoulder Flexion Stretch', date: '2026-06-16', duration: 8, completed: true, pain: 2, notes: 'Slight discomfort', loggedBy: 'c1' },
    { sessionId: 's3', patientId: 'p1', exerciseId: 'lib-5', exercise: 'Tongue Lateralisation', date: '2026-06-17', duration: 3, completed: true, pain: 0, notes: 'Improving', loggedBy: 'c1' },
    { sessionId: 's4', patientId: 'p1', exerciseId: 'lib-1', exercise: 'Finger taps 1.1', date: '2026-06-18', duration: 5, completed: false, pain: 3, notes: 'Fatigued quickly', loggedBy: 'c1' },
  ];

  for (const s of sessions) {
    const existing = await Session.findOne({ sessionId: s.sessionId });
    if (!existing) {
      await Session.create(s);
    }
  }

  const vitals = [
    { vitalId: 'v1', patientId: 'p1', date: '2026-06-15', heartRate: 78, bp: '120/80', temp: 36.6, oxygenSat: 97, weight: 72, mood: 'good', sleep: 7, loggedBy: 'c1' },
    { vitalId: 'v2', patientId: 'p1', date: '2026-06-18', heartRate: 82, bp: '125/85', temp: 36.8, oxygenSat: 96, weight: 71.5, mood: 'fair', sleep: 6, loggedBy: 'c1' },
  ];

  for (const v of vitals) {
    const existing = await Vital.findOne({ vitalId: v.vitalId });
    if (!existing) {
      await Vital.create(v);
    }
  }

  const recordings = [
    { recordingId: 'r1', doctorId: 'd1', patientId: 'p1', exerciseId: 'lib-1', title: 'Finger Tap Demo', description: 'Correct form for finger tap exercise', notes: 'Watch the hand position', videoUrl: 'https://www.youtube.com/embed?listType=search&list=finger%20taps%20demo', fileName: 'finger_tap_demo.mp4', uploadedAt: '2026-06-10', duration: 120, views: 5 },
    { recordingId: 'r2', doctorId: 'd1', patientId: 'p1', exerciseId: 'lib-5', title: 'Speech Exercise Guide', description: 'Tongue lateralisation technique', notes: 'Practice in front of mirror', videoUrl: 'https://www.youtube.com/embed?listType=search&list=speech%20exercise%20guide', fileName: 'speech_guide.mp4', uploadedAt: '2026-06-12', duration: 180, views: 3 },
  ];

  for (const r of recordings) {
    const existing = await Recording.findOne({ recordingId: r.recordingId });
    if (!existing) {
      await Recording.create(r);
    }
  }

  const messages = [
    { messageId: 'm1', patientId: 'p1', from: 'hp', to: 'patient', fromName: 'Dr. Santhi Kumaran', text: 'How are you feeling after the finger exercises?', time: '2026-06-16T10:00:00Z', read: true },
    { messageId: 'm2', patientId: 'p1', from: 'caregiver', to: 'patient', fromName: 'John Banda', text: 'Remember to do your stretches today.', time: '2026-06-17T08:30:00Z', read: true },
    { messageId: 'm3', patientId: 'p1', from: 'patient', to: 'hp', fromName: 'Mercy Banda', text: 'My shoulder feels better today.', time: '2026-06-17T14:00:00Z', read: false },
  ];

  for (const m of messages) {
    const existing = await Message.findOne({ messageId: m.messageId });
    if (!existing) {
      await Message.create(m);
    }
  }

  const alerts = [
    { alertId: 'a1', patientId: 'p1', type: 'warning', msg: 'Missed scheduled finger tap exercise session', time: '2026-06-18T09:00:00Z', read: false },
    { alertId: 'a2', patientId: 'p1', type: 'info', msg: 'Patient reported increased pain level (3/5)', time: '2026-06-18T10:30:00Z', read: false },
  ];

  for (const a of alerts) {
    const existing = await Alert.findOne({ alertId: a.alertId });
    if (!existing) {
      await Alert.create(a);
    }
  }

  const medications = [
    { medicationId: 'med1', patientId: 'p1', name: 'Aspirin', dose: '75mg', schedule: 'Once daily after breakfast', takenToday: true },
    { medicationId: 'med2', patientId: 'p1', name: 'Atorvastatin', dose: '20mg', schedule: 'Once daily at bedtime', takenToday: false },
  ];

  for (const med of medications) {
    const existing = await Medication.findOne({ medicationId: med.medicationId });
    if (!existing) {
      await Medication.create(med);
    }
  }

  console.log("Demo data seeded");
};

module.exports = seedDemoData;
