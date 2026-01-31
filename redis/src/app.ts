import express from "express";
import userRoutes from "./routes/user.routes";

export const app = express();

app.use(express.json());
app.use("/users", userRoutes);

app.get("/health", (_, res) => {
  res.send("OK");
});
