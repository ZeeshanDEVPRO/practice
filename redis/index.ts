require("dotenv").config();
import express from "express";
import userRoutes from "./routes/user";
import quizRoutes from "./routes/quiz";
import leaderboardRoutes from "./routes/leaderboard";
import redisClient from "./redis/redis";

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await redisClient.quit();
  } catch (err) {
    // ignore
  }
  process.exit(0);
});

export default app;
