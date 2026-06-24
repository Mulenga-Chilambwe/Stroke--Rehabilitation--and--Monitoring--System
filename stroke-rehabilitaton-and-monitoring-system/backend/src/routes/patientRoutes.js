// Patient routes — list patients, get profile, update progress (auth required)
const express = require("express");
const {
  listPatients,
  getPatientProfile,
  updateProgress,
} = require("../controllers/patientController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listPatients);
router.get("/:patientId", getPatientProfile);
router.put("/:patientId/progress", updateProgress);

module.exports = router;
