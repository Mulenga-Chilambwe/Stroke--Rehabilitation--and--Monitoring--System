// Medication controller — list, create, and toggle taken-today status for patient medications
const Medication = require("../models/Medication");

const listMedications = async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    const medications = await Medication.find(filter).sort({ name: 1 });
    return res.json(medications);
  } catch (error) {
    console.error("List medications error:", error);
    return res.status(500).json({ message: "Could not load medications." });
  }
};

const createMedication = async (req, res) => {
  try {
    const medication = await Medication.create({
      ...req.body,
      medicationId: `med${Date.now()}`,
    });
    return res.status(201).json(medication);
  } catch (error) {
    console.error("Create medication error:", error);
    return res.status(500).json({ message: "Could not create medication." });
  }
};

const toggleTaken = async (req, res) => {
  try {
    const medication = await Medication.findOne({ medicationId: req.params.id });
    if (!medication) {
      return res.status(404).json({ message: "Medication not found." });
    }
    medication.takenToday = !medication.takenToday;
    await medication.save();
    return res.json(medication);
  } catch (error) {
    console.error("Toggle medication error:", error);
    return res.status(500).json({ message: "Could not toggle medication." });
  }
};

module.exports = {
  listMedications,
  createMedication,
  toggleTaken,
};
