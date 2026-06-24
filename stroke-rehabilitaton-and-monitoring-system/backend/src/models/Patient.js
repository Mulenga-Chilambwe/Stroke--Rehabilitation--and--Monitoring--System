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
  doctorId: String
}, { timestamps: true });

patientSchema.index({ patientId: 1 });
patientSchema.index({ userId: 1 });

module.exports = mongoose.model('Patient', patientSchema);
