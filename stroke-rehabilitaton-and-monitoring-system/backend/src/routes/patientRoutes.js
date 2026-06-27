// Patient routes — list patients, get profile, update progress, patient profile update (auth required)
const express = require("express");
const {
  listPatients,
  getPatientProfile,
  updateProgress,
  updatePatientProfile,
} = require("../controllers/patientController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listPatients);
router.get("/:patientId", getPatientProfile);
router.put("/:patientId/progress", updateProgress);
router.put("/:patientId/profile", updatePatientProfile);

module.exports = router;
