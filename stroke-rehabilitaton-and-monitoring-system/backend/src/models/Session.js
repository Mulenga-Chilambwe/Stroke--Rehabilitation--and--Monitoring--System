// Mongoose Session model — tracks a patient's exercise session: completion, pain level, and notes
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  exerciseId: String,
  exercise: String,
  date: {
    type: String,
    required: true
  },
  duration: Number,
  completed: {
    type: Boolean,
    default: false
  },
  pain: {
    type: Number,
    default: 0
  },
  notes: String,
  loggedBy: String
}, { timestamps: true });

sessionSchema.index({ patientId: 1, date: -1 });

module.exports = mongoose.model('Session', sessionSchema);
