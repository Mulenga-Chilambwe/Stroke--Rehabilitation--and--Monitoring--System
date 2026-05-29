const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const seedDemoUsers = require("./src/seedDemoUsers");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/users", require("./src/routes/userRoutes"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDemoUsers();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();

process.on("unhandledRejection", (error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
