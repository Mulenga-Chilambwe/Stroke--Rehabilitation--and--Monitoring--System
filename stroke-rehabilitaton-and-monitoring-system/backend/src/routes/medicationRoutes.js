// Medication routes — list, create, and toggle taken-today (auth required)
const express = require("express");
const {
  listMedications,
  createMedication,
  toggleTaken,
} = require("../controllers/medicationController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listMedications);
router.post("/", createMedication);
router.post("/:id/toggle", toggleTaken);

module.exports = router;
