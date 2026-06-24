// Session controller — CRUD for exercise sessions (log, update, delete)
const Session = require("../models/Session");

const listSessions = async (req, res) => {
  try {
    const { patientId, date } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (date) filter.date = date;
    const sessions = await Session.find(filter).sort({ date: -1 });
    return res.json(sessions);
  } catch (error) {
    console.error("List sessions error:", error);
    return res.status(500).json({ message: "Could not load sessions." });
  }
};

const createSession = async (req, res) => {
  try {
    const { patientId, exerciseId, date } = req.body;
    const existing = await Session.findOne({ patientId, exerciseId, date });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.json(existing);
    }
    const session = await Session.create({
      ...req.body,
      sessionId: `s${Date.now()}`,
    });
    return res.status(201).json(session);
  } catch (error) {
    console.error("Create session error:", error);
    return res.status(500).json({ message: "Could not create session." });
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id });
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    Object.assign(session, req.body);
    await session.save();
    return res.json(session);
  } catch (error) {
    console.error("Update session error:", error);
    return res.status(500).json({ message: "Could not update session." });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ sessionId: req.params.id });
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    return res.json({ message: "Session deleted." });
  } catch (error) {
    console.error("Delete session error:", error);
    return res.status(500).json({ message: "Could not delete session." });
  }
};

module.exports = {
  listSessions,
  createSession,
  updateSession,
  deleteSession,
};
