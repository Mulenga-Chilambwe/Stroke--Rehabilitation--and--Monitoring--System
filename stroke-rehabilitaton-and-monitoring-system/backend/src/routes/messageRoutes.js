// Message routes — send, list, and mark messages as read (auth required)
const express = require("express");
const {
  listMessages,
  sendMessage,
  markRead,
} = require("../controllers/messageController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listMessages);
router.post("/", sendMessage);
router.post("/read", markRead);

module.exports = router;
