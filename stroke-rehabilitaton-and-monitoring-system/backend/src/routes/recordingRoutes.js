// Recording routes — CRUD for therapy recordings with view tracking (auth required)
const express = require("express");
const {
  listRecordings,
  createRecording,
  deleteRecording,
  incrementViews,
} = require("../controllers/recordingController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listRecordings);
router.post("/", createRecording);
router.delete("/:id", deleteRecording);
router.post("/:id/view", incrementViews);

module.exports = router;
