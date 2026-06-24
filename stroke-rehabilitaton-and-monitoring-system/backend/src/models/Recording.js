// Mongoose Recording model — personalised therapy videos uploaded by doctors for their patients
const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  recordingId: {
    type: String,
    required: true,
    unique: true
  },
  doctorId: {
    type: String,
    required: true
  },
  patientId: {
    type: String,
    required: true
  },
  exerciseId: String,
  title: {
    type: String,
    required: true
  },
  description: String,
  notes: String,
  videoUrl: String,
  fileName: String,
  uploadedAt: String,
  duration: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

recordingSchema.index({ recordingId: 1 });
recordingSchema.index({ doctorId: 1 });
recordingSchema.index({ patientId: 1 });

module.exports = mongoose.model('Recording', recordingSchema);
