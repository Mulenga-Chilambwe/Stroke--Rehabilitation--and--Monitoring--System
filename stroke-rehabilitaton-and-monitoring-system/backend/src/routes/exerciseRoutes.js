// Exercise routes — list all exercises and get by ID (auth required)
const express = require("express");
const { listExercises, getExercise } = require("../controllers/exerciseController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listExercises);
router.get("/:id", getExercise);

module.exports = router;
