// Mongoose Vital model — stores patient vitals (heart rate, BP, oxygen, mood) logged by caregivers
const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  vitalId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true
  },
  heartRate: Number,
  bp: String,
  temp: Number,
  oxygenSat: Number,
  weight: Number,
  mood: String,
  sleep: Number,
  loggedBy: String
}, { timestamps: true });

vitalSchema.index({ patientId: 1, date: -1 });

module.exports = mongoose.model('Vital', vitalSchema);
