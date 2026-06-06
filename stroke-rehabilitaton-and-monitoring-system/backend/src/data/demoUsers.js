const demoUsers = [
  {
    role: "patient",
    name: "Mercy Banda",
    avatar: "MB",
    color: "#1a7f74",
    email: "mercy@patient.zm",
    password: "patient123",
    patientId: "p1",
    caregiverId: "c1",
    doctorId: "d1",
    isAvailable: false,
  },
  {
    role: "caregiver",
    name: "John Banda",
    avatar: "JB",
    color: "#d97706",
    email: "john@caregiver.zm",
    password: "caregiver123",
    patientId: "p1",
    caregiverId: "c1",
    doctorId: "d1",
    isAvailable: false,
  },
  {
    role: "hp",
    name: "Dr. Santhi Kumaran",
    avatar: "SK",
    color: "#3b5bdb",
    email: "kumaran@cbu.ac.zm",
    password: "doctor123",
    doctorId: "d1",
    isAvailable: true,
  },
];

module.exports = demoUsers;
