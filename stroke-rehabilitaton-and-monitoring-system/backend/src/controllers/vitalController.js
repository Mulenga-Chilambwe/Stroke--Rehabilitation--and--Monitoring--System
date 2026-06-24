// Vital controller — list, create, and fetch latest vitals for a patient
const Vital = require("../models/Vital");

const listVitals = async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    const vitals = await Vital.find(filter).sort({ date: -1 });
    return res.json(vitals);
  } catch (error) {
    console.error("List vitals error:", error);
    return res.status(500).json({ message: "Could not load vitals." });
  }
};

const createVital = async (req, res) => {
  try {
    const vital = await Vital.create({
      ...req.body,
      vitalId: `v${Date.now()}`,
    });
    return res.status(201).json(vital);
  } catch (error) {
    console.error("Create vital error:", error);
    return res.status(500).json({ message: "Could not create vital." });
  }
};

const getLatestVital = async (req, res) => {
  try {
    const vital = await Vital.findOne({ patientId: req.params.patientId }).sort({ date: -1, createdAt: -1 });
    if (!vital) {
      return res.status(404).json({ message: "No vitals found for this patient." });
    }
    return res.json(vital);
  } catch (error) {
    console.error("Get latest vital error:", error);
    return res.status(500).json({ message: "Could not load vital." });
  }
};

module.exports = {
  listVitals,
  createVital,
  getLatestVital,
};
