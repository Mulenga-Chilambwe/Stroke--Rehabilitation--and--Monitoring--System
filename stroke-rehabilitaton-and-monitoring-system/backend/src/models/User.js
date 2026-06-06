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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
