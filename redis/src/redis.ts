import { createClient } from "redis";
import {app} from "./app";

export const redis = createClient({
  url: "redis://localhost:6379"
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});


async function startServer() {
  
   if (!redis.isOpen) {
    await redis.connect();
    console.log("Redis connected");
  }

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
