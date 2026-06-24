// User controller — handles registration, login, doctor availability, and listing available doctors
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Patient = require("../models/Patient");
const { colorForRole, createToken, initialsFromName, publicUser } = require("../utils/auth");

const createRecordId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, caregiverEmail, doctorId } = req.body;
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanCaregiverEmail = String(caregiverEmail || "").trim().toLowerCase();
    const cleanDoctorId = String(doctorId || "").trim();

    if (!cleanName || !cleanEmail || !password || !role) {
      return res.status(400).json({ message: "Please complete all required fields." });
    }

    if (!["patient", "caregiver", "hp"].includes(role)) {
      return res.status(400).json({ message: "Invalid account role." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role,
      avatar: initialsFromName(cleanName),
      color: colorForRole(role),
      patientId: "",
      doctorId: "",
      caregiverId: "",
      isAvailable: role === "hp",
    };

    if (role === "caregiver") {
      userData.isAvailable = false;
    }

    if (role === "hp") {
      userData.doctorId = createRecordId("d");
    }

    if (role === "patient") {
      if (!cleanCaregiverEmail) {
        return res.status(400).json({ message: "Please enter the caregiver email." });
      }

      if (!cleanDoctorId) {
        return res.status(400).json({ message: "Please select one available doctor." });
      }

      const caregiver = await User.findOne({ email: cleanCaregiverEmail, role: "caregiver" });
      if (!caregiver) {
        return res.status(400).json({ message: "Caregiver email was not found. Please enter a registered caregiver email." });
      }

      if (caregiver.patientId) {
        return res.status(400).json({ message: "This caregiver is already assigned to another patient. Please enter another caregiver email." });
      }

      const doctor = await User.findOne({ role: "hp", doctorId: cleanDoctorId, isAvailable: true });
      if (!doctor) {
        return res.status(400).json({ message: "Selected doctor is no longer available. Please choose another doctor." });
      }

      const patientId = createRecordId("p");
      const caregiverId = caregiver.caregiverId || createRecordId("c");
      caregiver.patientId = patientId;
      caregiver.doctorId = cleanDoctorId;
      caregiver.caregiverId = caregiverId;
      await caregiver.save();

      userData.patientId = patientId;
      userData.doctorId = cleanDoctorId;
      userData.caregiverId = caregiverId;
      userData.isAvailable = false;
    }

    const user = await User.create(userData);

    if (role === "patient") {
      try {
        const caregiverUser = await User.findOne({ email: cleanCaregiverEmail, role: "caregiver" });
        await Patient.create({
          userId: user._id,
          patientId: user.patientId,
          name: cleanName,
          avatar: user.avatar,
          age: 0,
          condition: "Stroke Rehabilitation",
          admitDate: new Date().toISOString().split('T')[0],
          rehabStart: new Date().toISOString().split('T')[0],
          progress: 0,
          streak: 0,
          totalSessions: 0,
          targetSessions: 30,
          risk: "moderate",
          focus: [],
          caregiverId: user.caregiverId,
          doctorId: user.doctorId,
        });
      } catch (err) {
        console.error("Patient record creation error (non-blocking):", err);
      }
    }

    return res.status(201).json({
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Could not create account." });
  }
};

const listAvailableDoctors = async (_req, res) => {
  try {
    const doctors = await User.find({ role: "hp", isAvailable: true }).sort({ name: 1 });

    return res.json({
      doctors: doctors.map((doctor) => ({
        id: doctor.doctorId,
        name: doctor.name,
        email: doctor.email,
        avatar: doctor.avatar,
        color: doctor.color,
        isAvailable: doctor.isAvailable,
      })),
    });
  } catch (error) {
    console.error("Available doctors error:", error);
    return res.status(500).json({ message: "Could not load available doctors." });
  }
};

const updateDoctorAvailability = async (req, res) => {
  try {
    const { email, isAvailable } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    const doctor = await User.findOne({ email: cleanEmail, role: "hp" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor account was not found." });
    }

    doctor.isAvailable = Boolean(isAvailable);
    await doctor.save();

    return res.json({
      user: publicUser(doctor),
    });
  } catch (error) {
    console.error("Doctor availability error:", error);
    return res.status(500).json({ message: "Could not update doctor availability." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Could not sign in." });
  }
};

module.exports = {
  listAvailableDoctors,
  loginUser,
  registerUser,
  updateDoctorAvailability,
};
