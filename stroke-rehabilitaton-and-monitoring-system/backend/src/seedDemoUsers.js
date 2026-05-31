const bcrypt = require("bcryptjs");
const demoUsers = require("./data/demoUsers");
const User = require("./models/User");

const seedDemoUsers = async () => {
  await Promise.all(
    demoUsers.map(async (user) => {
      const email = user.email.toLowerCase();
      const exists = await User.findOne({ email });

      if (exists) {
        exists.name = user.name;
        exists.role = user.role;
        exists.avatar = user.avatar;
        exists.color = user.color;
        exists.patientId = user.patientId || "";
        exists.doctorId = user.doctorId || "";
        exists.password = await bcrypt.hash(user.password, 10);
        return exists.save();
      }

      return User.create({
        ...user,
        email,
        password: await bcrypt.hash(user.password, 10),
      });
    })
  );
  console.log("Demo users ready");
};

module.exports = seedDemoUsers;
