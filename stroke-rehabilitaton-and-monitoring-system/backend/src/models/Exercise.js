// Mongoose Exercise model — library of rehab exercises with video links, difficulty, and safety notes
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  bodyPart: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'med', 'hard']
  },
  duration: Number,
  sets: String,
  freq: String,
  icon: String,
  videoUrl: String,
  videoSearchUrl: String,
  videoProvider: String,
  safety: String,
  description: String
}, { timestamps: true });

exerciseSchema.index({ exerciseId: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
