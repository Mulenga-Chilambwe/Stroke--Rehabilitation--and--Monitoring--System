// Alert controller — create, list, and mark alerts (warnings/info) for patient care
const Alert = require("../models/Alert");

const listAlerts = async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    return res.json(alerts);
  } catch (error) {
    console.error("List alerts error:", error);
    return res.status(500).json({ message: "Could not load alerts." });
  }
};

const createAlert = async (req, res) => {
  try {
    const alert = await Alert.create({
      ...req.body,
      alertId: `a${Date.now()}`,
    });
    return res.status(201).json(alert);
  } catch (error) {
    console.error("Create alert error:", error);
    return res.status(500).json({ message: "Could not create alert." });
  }
};

const markRead = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { alertId: req.params.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ message: "Alert not found." });
    }
    return res.json(alert);
  } catch (error) {
    console.error("Mark alert read error:", error);
    return res.status(500).json({ message: "Could not update alert." });
  }
};

module.exports = {
  listAlerts,
  createAlert,
  markRead,
};
