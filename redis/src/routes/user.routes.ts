import { Router } from "express";
import { redis } from "../redis";

const router = Router();

// fake DB function
async function getUserFromDB(id: string) {
  return { id, name: "Zeeshan", role: "admin" };
}

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `user:${id}`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // 2. Fetch from DB
  const user = await getUserFromDB(id);

  // 3. Store in Redis (TTL required)
  await redis.set(cacheKey, JSON.stringify(user), {
    EX: 60
  });

  res.json(user);
});

export default router;
