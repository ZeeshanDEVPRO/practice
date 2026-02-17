import { Router } from "express";
import quizServices from "../services/quizServices";
import auth from "../middleware/auth";
import redis from "../redis/redis";
import userServices from "../services/userServices";

const router = Router();

// GET /api/quiz/:id/results  -> cache-aside, TTL 60s
router.get("/:id/results", auth, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const results = await quizServices.getQuizResults(id);
    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to get quiz results" });
  }
});

// POST /api/quiz/:id/update -> simulate update and invalidate cache
router.post("/:id/update", auth, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payload = req.body;
    const result = await quizServices.updateQuiz(id, payload);
    res.json({ message: "Quiz updated and cache invalidated", result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update quiz" });
  }
});

// Rate limiter middleware: max 5 submissions per minute per user
async function submissionsRateLimit(req: any, res: any, next: any) {
  try {
    const user = (req as any).user?.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const key = `rate:submissions:${user}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 60);
    }
    if (count > 5) {
      return res.status(429).json({ error: "Rate limit exceeded: max 5 submissions per minute" });
    }
    next();
  } catch (err: any) {
    next(err);
  }
}

// POST /api/quiz/:id/submit -> protected by rate limiter
router.post("/:id/submit", auth, submissionsRateLimit, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = (req as any).user?.user;
    // Simulate checking answers and awarding points (here fixed points)
    const points = Number(req.body.points || 1);
    // Push job into Redis list for background processing
    const job = { user, quizId: id, points, ts: Date.now() };
    await redis.lpush("jobs:scoreQueue", JSON.stringify(job));
    res.status(202).json({ message: "Submission accepted and queued" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit quiz" });
  }
});

export default router;
