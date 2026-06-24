// Mongoose Message model — care team communication between patient, caregiver, and health professional
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  fromName: String,
  text: {
    type: String,
    required: true
  },
  time: String,
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

messageSchema.index({ messageId: 1 });
messageSchema.index({ patientId: 1 });
messageSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model('Message', messageSchema);
