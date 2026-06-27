// Seed demo users — upserts patient/caregiver/hp accounts with hashed passwords
const bcrypt = require("bcryptjs");
const demoUsers = require("./data/demoUsers");
const User = require("./models/User");

const seedDemoUsers = async () => {
  await Promise.all(
    demoUsers.map(async (user) => {
      const email = user.email.toLowerCase();
      const exists = await User.findOne({ email });

      const profileFields = [
        'phone', 'bio', 'title', 'institution', 'licenseNumber',
        'yearsOfExperience', 'officeLocation', 'specialties',
        'relation', 'dob', 'gender', 'bloodType', 'height', 'weight',
        'emergencyName', 'emergencyRelation', 'emergencyPhone',
        'profileComplete'
      ];

      if (exists) {
        exists.name = user.name;
        exists.role = user.role;
        exists.avatar = user.avatar;
        exists.color = user.color;
        exists.patientId = user.patientId || "";
        exists.doctorId = user.doctorId || "";
        exists.caregiverId = user.caregiverId || "";
        exists.isAvailable = user.isAvailable ?? exists.isAvailable;
        exists.password = await bcrypt.hash(user.password, 10);
        profileFields.forEach(field => {
          if (user[field] !== undefined) exists[field] = user[field];
        });
        return exists.save();
      }

      const userData = {
        ...user,
        email,
        caregiverId: user.caregiverId || "",
        isAvailable: user.isAvailable ?? user.role === "hp",
        password: await bcrypt.hash(user.password, 10),
      };
      profileFields.forEach(field => {
        if (user[field] === undefined) userData[field] = field === 'profileComplete' ? false : (field === 'yearsOfExperience' ? 0 : '');
      });

      return User.create(userData);
    })
  );
  console.log("Demo users ready");
};

module.exports = seedDemoUsers;
