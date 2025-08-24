import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { bootstrapUniverse } from "./services/universeService.js";
import { startDiscordBot } from "./discord/discordBot.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Bootstrap universe data
await bootstrapUniverse();

// Start Discord bot (non-blocking)
startDiscordBot().catch((err) => console.error("Discord bot failed:", err));

// Use routes
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
