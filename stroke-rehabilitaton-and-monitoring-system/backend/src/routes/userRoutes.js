const express = require("express");
const {
  listAvailableDoctors,
  loginUser,
  registerUser,
  updateDoctorAvailability,
} = require("../controllers/userController");

const router = express.Router();

router.get("/doctors/available", listAvailableDoctors);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/doctors/availability", updateDoctorAvailability);

module.exports = router;
