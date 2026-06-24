// Recording controller — manage doctor-uploaded therapy recordings (CRUD + view tracking)
const Recording = require("../models/Recording");

const listRecordings = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;
    const recordings = await Recording.find(filter).sort({ createdAt: -1 });
    return res.json(recordings);
  } catch (error) {
    console.error("List recordings error:", error);
    return res.status(500).json({ message: "Could not load recordings." });
  }
};

const createRecording = async (req, res) => {
  try {
    const recording = await Recording.create({
      ...req.body,
      recordingId: `rec-${Date.now()}`,
    });
    return res.status(201).json(recording);
  } catch (error) {
    console.error("Create recording error:", error);
    return res.status(500).json({ message: "Could not create recording." });
  }
};

const deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findOneAndDelete({ recordingId: req.params.id });
    if (!recording) {
      return res.status(404).json({ message: "Recording not found." });
    }
    return res.json({ message: "Recording deleted." });
  } catch (error) {
    console.error("Delete recording error:", error);
    return res.status(500).json({ message: "Could not delete recording." });
  }
};

const incrementViews = async (req, res) => {
  try {
    const recording = await Recording.findOne({ recordingId: req.params.id });
    if (!recording) {
      return res.status(404).json({ message: "Recording not found." });
    }
    recording.views = (recording.views || 0) + 1;
    await recording.save();
    return res.json(recording);
  } catch (error) {
    console.error("Increment views error:", error);
    return res.status(500).json({ message: "Could not update views." });
  }
};

module.exports = {
  listRecordings,
  createRecording,
  deleteRecording,
  incrementViews,
};
