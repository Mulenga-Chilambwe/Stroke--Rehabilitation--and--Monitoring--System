const bcrypt = require("bcryptjs");
const demoUsers = require("./data/demoUsers");
const User = require("./models/User");

const seedDemoUsers = async () => {
  await Promise.all(
    demoUsers.map(async (user) => {
      const email = user.email.toLowerCase();
      const exists = await User.exists({ email });

      if (exists) return null;

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
