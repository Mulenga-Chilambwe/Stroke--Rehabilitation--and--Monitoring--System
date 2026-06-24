// Express server — entry point for the StrokeRehab backend API
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const seedDemoUsers = require("./src/seedDemoUsers");
const seedDemoData = require("./src/seedDemoData");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/exercises", require("./src/routes/exerciseRoutes"));
app.use("/api/sessions", require("./src/routes/sessionRoutes"));
app.use("/api/vitals", require("./src/routes/vitalRoutes"));
app.use("/api/recordings", require("./src/routes/recordingRoutes"));
app.use("/api/messages", require("./src/routes/messageRoutes"));
app.use("/api/alerts", require("./src/routes/alertRoutes"));
app.use("/api/medications", require("./src/routes/medicationRoutes"));
app.use("/api/patients", require("./src/routes/patientRoutes"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDemoUsers();
  await seedDemoData();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();

process.on("unhandledRejection", (error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
