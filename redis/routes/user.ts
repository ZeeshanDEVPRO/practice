import { Router } from "express";
import userServices from "../services/userServices";
import auth from "../middleware/auth";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { user, password } = req.body;
    const token = await userServices.login(user, password);
    res.json({ token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { user, password, username } = req.body;
    const result = await userServices.signup(user, password, username);
    res.status(201).json({ message: "User created", user: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Signup failed" });
  }
});

// Task 2: Get user profile using HGETALL
router.get("/profile/:userId", auth, async (req, res) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const profile = await userServices.getUserProfile(userId);
    res.json({ profile });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to get profile" });
  }
});

// Task 2: Increment score atomically using HINCRBY
router.post("/profile/:userId/incrementScore", auth, async (req, res) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const { points } = req.body;
    if (!points || isNaN(points)) {
      return res.status(400).json({ error: "points must be a valid number" });
    }
    const newScore = await userServices.incrementScore(userId, parseInt(points));
    res.json({ message: "Score incremented", newScore });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to increment score" });
  }
});

// Task 2: Increment quizzes solved
router.post("/profile/:userId/quizComplete", auth, async (req, res) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const newCount = await userServices.incrementQuizzesSolved(userId);
    res.json({ message: "Quiz count incremented", quizzesSolved: newCount });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to increment quiz count" });
  }
});

// Task 2: Update profile fields using HSET
router.put("/profile/:userId", auth, async (req, res) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const updates = req.body;
    const profile = await userServices.updateProfile(userId, updates);
    res.json({ message: "Profile updated", profile });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update profile" });
  }
});

router.delete("/user/:id", auth, (req, res) => {
  res.send(`User ${req.params.id} deleted`);
});

export default router;