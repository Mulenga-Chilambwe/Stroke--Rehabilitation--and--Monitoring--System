// Vital routes — list, create, and get latest vitals (auth required)
const express = require("express");
const {
  listVitals,
  createVital,
  getLatestVital,
} = require("../controllers/vitalController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listVitals);
router.post("/", createVital);
router.get("/latest/:patientId", getLatestVital);

module.exports = router;
