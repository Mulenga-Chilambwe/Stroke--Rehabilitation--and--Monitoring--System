// Patient controller — CRUD for patient profiles, progress tracking, and privacy-controlled data entry
const Patient = require("../models/Patient");
const User = require("../models/User");

const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    const caregiver = patient.caregiverId
      ? await User.findOne({ caregiverId: patient.caregiverId }).select("name email avatar color caregiverId phone relation")
      : null;
    const doctor = patient.doctorId
      ? await User.findOne({ doctorId: patient.doctorId }).select("name email avatar color doctorId phone title institution")
      : null;

    const patientUser = await User.findById(patient.userId).select("-password");

    const requestingUser = req.user;
    const isPatient = requestingUser.patientId === patient.patientId;
    const isDoctor = requestingUser.role === 'hp';

    let profileData = patient.toObject();

    // Privacy control: only show patient-entered data if patient has filled it in
    if (!patient.patientEntered && !isPatient) {
      profileData.strokeType = 'Not yet provided';
      profileData.strokeDate = 'Not yet provided';
      profileData.affectedSide = 'Not yet provided';
      profileData.initialSymptoms = 'Not yet provided';
      profileData.preExistingConditions = 'Not yet provided';
      profileData.allergies = 'Not yet provided';
      profileData.familyHistory = 'Not yet provided';
      profileData.rehabGoals = 'Not yet provided';
      profileData.preferredDays = 'Not yet provided';
      profileData.mobilityLevel = '';
      profileData.speechStatus = '';
      profileData.cognitiveStatus = '';
    }

    return res.json({ ...profileData, caregiver, doctor, patientUser });
  } catch (error) {
    console.error("Get patient profile error:", error);
    return res.status(500).json({ message: "Could not load patient profile." });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { progress, streak, totalSessions } = req.body;
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    if (progress !== undefined) patient.progress = progress;
    if (streak !== undefined) patient.streak = streak;
    if (totalSessions !== undefined) patient.totalSessions = totalSessions;
    await patient.save();
    return res.json(patient);
  } catch (error) {
    console.error("Update progress error:", error);
    return res.status(500).json({ message: "Could not update progress." });
  }
};

const listPatients = async (req, res) => {
  try {
    const { doctorId } = req.query;
    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    const patients = await Patient.find(filter).sort({ name: 1 });

    // For doctor view, mask un-entered patient data
    const requestingUser = req.user;
    if (requestingUser && requestingUser.role === 'hp') {
      return res.json(patients.map(p => {
        const obj = p.toObject();
        if (!obj.patientEntered) {
          obj.age = null;
          obj.condition = 'Awaiting patient info';
          obj.strokeType = 'Not yet provided';
          obj.strokeDate = 'Not yet provided';
        }
        return obj;
      }));
    }

    return res.json(patients);
  } catch (error) {
    console.error("List patients error:", error);
    return res.status(500).json({ message: "Could not load patients." });
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const requestingUser = req.user;
    const isPatient = requestingUser.patientId === patient.patientId;

    if (!isPatient) {
      return res.status(403).json({ message: "Only the patient can update their own profile." });
    }

    const allowedFields = [
      'strokeType', 'strokeDate', 'affectedSide', 'initialSymptoms',
      'preExistingConditions', 'allergies', 'familyHistory',
      'rehabGoals', 'preferredDays', 'mobilityLevel', 'speechStatus',
      'cognitiveStatus', 'age', 'condition'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    }

    patient.patientEntered = true;
    await patient.save();

    return res.json(patient);
  } catch (error) {
    console.error("Update patient profile error:", error);
    return res.status(500).json({ message: "Could not update patient profile." });
  }
};

module.exports = {
  getPatientProfile,
  updateProgress,
  listPatients,
  updatePatientProfile,
};
