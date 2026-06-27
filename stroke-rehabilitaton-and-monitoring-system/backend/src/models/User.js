// Mongoose User model — stores login credentials, role, and linked IDs for patients/caregivers/health pros
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "caregiver", "hp"],
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#1a7f74",
    },
    patientId: {
      type: String,
      default: "",
    },
    doctorId: {
      type: String,
      default: "",
    },
    caregiverId: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Profile fields - common
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    // Profile fields - doctor/hp
    title: { type: String, default: "" },
    institution: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    yearsOfExperience: { type: Number, default: 0 },
    officeLocation: { type: String, default: "" },
    specialties: [{ type: String }],
    // Profile fields - caregiver
    relation: { type: String, default: "" },
    // Profile fields - patient (basic, entered during profile setup)
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    bloodType: { type: String, default: "" },
    height: { type: String, default: "" },
    weight: { type: String, default: "" },
    emergencyName: { type: String, default: "" },
    emergencyRelation: { type: String, default: "" },
    emergencyPhone: { type: String, default: "" },
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
