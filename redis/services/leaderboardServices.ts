import redis from "../redis/redis";

const LEADERBOARD_KEY = "leaderboard:global";

const leaderboardServices = {
  async addUser(userId: string, score = 0) {
    await redis.zadd(LEADERBOARD_KEY, score, userId);
  },

  async incrScore(userId: string, points: number) {
    // ZINCRBY returns the new score
    const newScore = await redis.zincrby(LEADERBOARD_KEY, points, userId);
    return typeof newScore === "string" ? parseFloat(newScore) : newScore;
  },

  async top(n = 10) {
    // returns array of { userId, score }
    const items = await redis.zrevrange(LEADERBOARD_KEY, 0, n - 1, "WITHSCORES");
    const res: Array<{ userId: string; score: number }> = [];
    for (let i = 0; i < items.length; i += 2) {
      res.push({ userId: items[i], score: parseFloat(items[i + 1]) });
    }
    return res;
  },

  async rank(userId: string) {
    // zrevrank returns 0-based rank or null
    const r = await redis.zrevrank(LEADERBOARD_KEY, userId);
    if (r === null) return null;
    return r + 1; // make it 1-based
  },
};

export default leaderboardServices;
