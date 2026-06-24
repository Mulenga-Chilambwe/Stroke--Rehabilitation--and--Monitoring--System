// Patient controller — CRUD for patient profiles and progress tracking
const Patient = require("../models/Patient");
const User = require("../models/User");

const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    const caregiver = patient.caregiverId
      ? await User.findOne({ caregiverId: patient.caregiverId }).select("name email avatar color caregiverId")
      : null;
    const doctor = patient.doctorId
      ? await User.findOne({ doctorId: patient.doctorId }).select("name email avatar color doctorId")
      : null;
    return res.json({ ...patient.toObject(), caregiver, doctor });
  } catch (error) {
    console.error("Get patient profile error:", error);
    return res.status(500).json({ message: "Could not load patient profile." });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { progress, streak, totalSessions } = req.body;
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    if (progress !== undefined) patient.progress = progress;
    if (streak !== undefined) patient.streak = streak;
    if (totalSessions !== undefined) patient.totalSessions = totalSessions;
    await patient.save();
    return res.json(patient);
  } catch (error) {
    console.error("Update progress error:", error);
    return res.status(500).json({ message: "Could not update progress." });
  }
};

const listPatients = async (req, res) => {
  try {
    const { doctorId } = req.query;
    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    const patients = await Patient.find(filter).sort({ name: 1 });
    return res.json(patients);
  } catch (error) {
    console.error("List patients error:", error);
    return res.status(500).json({ message: "Could not load patients." });
  }
};

module.exports = {
  getPatientProfile,
  updateProgress,
  listPatients,
};
