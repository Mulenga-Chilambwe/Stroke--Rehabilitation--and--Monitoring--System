// Alert routes — list, create, and mark alerts as read (auth required)
const express = require("express");
const {
  listAlerts,
  createAlert,
  markRead,
} = require("../controllers/alertController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listAlerts);
router.post("/", createAlert);
router.post("/read/:id", markRead);

module.exports = router;
