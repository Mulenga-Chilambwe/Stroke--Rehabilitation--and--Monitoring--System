// Mongoose Alert model — warnings and info notifications for patient care events
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['warning', 'info']
  },
  msg: {
    type: String,
    required: true
  },
  time: String,
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

alertSchema.index({ alertId: 1 });
alertSchema.index({ patientId: 1 });

module.exports = mongoose.model('Alert', alertSchema);
