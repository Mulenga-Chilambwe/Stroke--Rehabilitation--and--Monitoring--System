// Mongoose Patient model — stores clinical profile, progress metrics, and assigned caregiver/doctor IDs
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: String,
  age: Number,
  condition: String,
  admitDate: String,
  rehabStart: String,
  progress: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  targetSessions: {
    type: Number,
    default: 30
  },
  risk: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },
  focus: [String],
  caregiverId: String,
  doctorId: String,
  // Patient-entered profile data (privacy-controlled)
  patientEntered: { type: Boolean, default: false },
  strokeType: { type: String, default: '' },
  strokeDate: { type: String, default: '' },
  affectedSide: { type: String, default: '' },
  initialSymptoms: { type: String, default: '' },
  preExistingConditions: { type: String, default: '' },
  allergies: { type: String, default: '' },
  familyHistory: { type: String, default: '' },
  rehabGoals: { type: String, default: '' },
  preferredDays: { type: String, default: '' },
  mobilityLevel: { type: String, enum: ['independent', 'minimal assistance', 'moderate assistance', 'dependent'], default: '' },
  speechStatus: { type: String, enum: ['normal', 'mild impairment', 'moderate impairment', 'severe impairment'], default: '' },
  cognitiveStatus: { type: String, enum: ['normal', 'mild impairment', 'moderate impairment', 'severe impairment'], default: '' },
}, { timestamps: true });

patientSchema.index({ patientId: 1 });
patientSchema.index({ userId: 1 });

module.exports = mongoose.model('Patient', patientSchema);
