// Mongoose Medication model — patient medications with daily taken-today tracking
const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  medicationId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  dose: String,
  schedule: String,
  takenToday: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

medicationSchema.index({ medicationId: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
