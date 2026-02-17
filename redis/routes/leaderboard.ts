import { Router } from "express";
import leaderboardServices from "../services/leaderboardServices";
import auth from "../middleware/auth";

const router = Router();

// GET /api/leaderboard/top/:n
router.get("/top/:n?", async (req, res) => {
  try {
    const nParam = (req.params as any).n || req.query.n || "10";
    const n = parseInt(Array.isArray(nParam) ? nParam[0] : String(nParam), 10) || 10;
    const top = await leaderboardServices.top(n);
    res.json({ top });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to get leaderboard" });
  }
});

// GET /api/leaderboard/rank/:userId
router.get("/rank/:userId", async (req, res) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const rank = await leaderboardServices.rank(userId);
    res.json({ userId, rank });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to get rank" });
  }
});

// POST /api/leaderboard/increment/:userId (protected)
router.post("/increment/:userId", auth, async (req, res) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const points = Number(req.body.points || 1);
    if (isNaN(points)) return res.status(400).json({ error: "points must be a number" });
    const newScore = await leaderboardServices.incrScore(userId, points);
    const rank = await leaderboardServices.rank(userId);
    res.json({ userId, newScore, rank });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to increment score" });
  }
});

export default router;
