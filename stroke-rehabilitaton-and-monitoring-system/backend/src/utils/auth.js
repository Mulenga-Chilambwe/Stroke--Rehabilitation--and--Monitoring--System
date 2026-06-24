// Auth utilities — JWT token creation, sanitised user object, avatar helpers
const jwt = require("jsonwebtoken");

const createToken = (user) => {
  const secret = process.env.JWT_SECRET || "dev-stroke-rehab-secret";

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    secret,
    { expiresIn: "7d" }
  );
};

const publicUser = (user) => ({
  id: user._id.toString(),
  role: user.role,
  name: user.name,
  avatar: user.avatar,
  color: user.color,
  email: user.email,
  patientId: user.patientId,
  doctorId: user.doctorId,
  caregiverId: user.caregiverId,
  isAvailable: user.isAvailable,
});

const initialsFromName = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const colorForRole = (role) => {
  if (role === "caregiver") return "#d97706";
  if (role === "hp") return "#3b5bdb";
  return "#1a7f74";
};

module.exports = {
  colorForRole,
  createToken,
  initialsFromName,
  publicUser,
};
