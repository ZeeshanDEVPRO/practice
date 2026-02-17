require("dotenv").config();
import redis from "../redis/redis";

async function run() {
  const sub = redis.duplicate();
  try {
    await sub.connect();
  } catch (e) {
    // duplicate may already be connected depending on ioredis version
  }

  console.log("Subscribed to leaderboard:events");
  await sub.subscribe("leaderboard:events");
  sub.on("message", (channel: string, message: string) => {
    try {
      const payload = JSON.parse(message);
      console.log("Leaderboard event:", payload);
    } catch (err) {
      console.log("Leaderboard event (raw):", message);
    }
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
