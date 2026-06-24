// Message controller — send, list, and mark messages as read within the care team
const Message = require("../models/Message");

const listMessages = async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    const messages = await Message.find(filter).sort({ createdAt: -1 });
    return res.json(messages);
  } catch (error) {
    console.error("List messages error:", error);
    return res.status(500).json({ message: "Could not load messages." });
  }
};

const sendMessage = async (req, res) => {
  try {
    const message = await Message.create({
      ...req.body,
      messageId: `m${Date.now()}`,
    });
    return res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: "Could not send message." });
  }
};

const markRead = async (req, res) => {
  try {
    const { patientId, from, to } = req.body;
    const filter = { read: false };
    if (patientId) filter.patientId = patientId;
    if (from) filter.from = from;
    if (to) filter.to = to;
    await Message.updateMany(filter, { $set: { read: true } });
    return res.json({ message: "Messages marked as read." });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({ message: "Could not mark messages as read." });
  }
};

module.exports = {
  listMessages,
  sendMessage,
  markRead,
};
