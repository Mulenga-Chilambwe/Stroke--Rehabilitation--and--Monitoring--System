// Session routes — CRUD for exercise sessions (auth required)
const express = require("express");
const {
  listSessions,
  createSession,
  updateSession,
  deleteSession,
} = require("../controllers/sessionController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listSessions);
router.post("/", createSession);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

module.exports = router;
