const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { colorForRole, createToken, initialsFromName, publicUser } = require("../utils/auth");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();

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
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role,
      avatar: initialsFromName(cleanName),
      color: colorForRole(role),
      patientId: role === "patient" || role === "caregiver" ? "p1" : "",
      doctorId: role === "hp" ? "d1" : "",
    });

    return res.status(201).json({
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Could not create account." });
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
  loginUser,
  registerUser,
};
