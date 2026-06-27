// User routes — login, register, doctor availability, profile management endpoints
const express = require("express");
const {
  listAvailableDoctors,
  loginUser,
  registerUser,
  updateDoctorAvailability,
  updateProfile,
  getProfile,
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/doctors/available", listAvailableDoctors);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/doctors/availability", updateDoctorAvailability);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
