// Exercise controller — list all exercises or get one by ID
const Exercise = require("../models/Exercise");

const listExercises = async (_req, res) => {
  try {
    const exercises = await Exercise.find().sort({ name: 1 });
    return res.json(exercises);
  } catch (error) {
    console.error("List exercises error:", error);
    return res.status(500).json({ message: "Could not load exercises." });
  }
};

const getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findOne({ exerciseId: req.params.id });
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found." });
    }
    return res.json(exercise);
  } catch (error) {
    console.error("Get exercise error:", error);
    return res.status(500).json({ message: "Could not load exercise." });
  }
};

module.exports = {
  listExercises,
  getExercise,
};
