require("dotenv").config();
import redis from "../redis/redis";
import userServices from "../services/userServices";

async function processJob(jobRaw: string) {
  try {
    const job = JSON.parse(jobRaw) as { user: string; quizId: string; points: number; ts?: number };
    console.log("Processing job:", job);
    if (!job.user) throw new Error("No user in job");

    // Update quizzes solved and score (userServices handles leaderboard sync)
    await userServices.incrementQuizzesSolved(job.user);
    const newScore = await userServices.incrementScore(job.user, Number(job.points || 0));
    console.log(`Processed job for ${job.user}, newScore=${newScore}`);
  } catch (err: any) {
    console.error("Failed to process job:", err);
  }
}

async function run() {
  console.log("Score worker started, waiting for jobs...");
  while (true) {
    try {
      // BRPOP returns [key, value]
      const res = await (redis as any).brpop("jobs:scoreQueue", 0);
      if (res && res[1]) {
        await processJob(res[1]);
      }
    } catch (err: any) {
      console.error("Worker error, retrying in 1s:", err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

process.on("SIGINT", async () => {
  try {
    await redis.quit();
  } catch (e) {}
  process.exit(0);
});

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
