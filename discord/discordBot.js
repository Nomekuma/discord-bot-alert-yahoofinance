import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { Universe } from "../services/universeService.js";
import { buildDateRange, normalizeInterval } from "../utils/dateUtils.js";
import { limitConcurrency } from "../utils/concurrency.js";
import { alertForSymbol } from "../controller/alertController.js";
import { SYMBOL_NAMES } from "../constants/marketSymbols.js";
import { VALID_INTERVALS } from "../constants/IntervalRange.js";
import { createAlertEmbed } from "./embedTemplate.js";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const BOT_INTERVAL_SEC = Number(process.env.BOT_INTERVAL_SEC ?? 300);
const BOT_UNIVERSE = String(process.env.BOT_UNIVERSE ?? "all").toLowerCase();
const BOT_LIMIT = Math.max(
  1,
  Math.min(Number(process.env.BOT_LIMIT ?? 150), 500)
);
const MSG_DELAY_MS = Math.max(
  0,
  Number(process.env.BOT_INTERVAL_BETWEEN_MSG_MS ?? 60)
);
const BOT_INTERVAL = normalizeInterval(process.env.BOT_INTERVAL ?? "1d");
const BOT_RANGE = process.env.BOT_RANGE ?? "6mo";

const lastAlertBySymbol = new Map();

async function sendDiscordMessages(channel, items) {
  for (const it of items) {
    const name = SYMBOL_NAMES[it.symbol] || it.symbol;
    const embed = createAlertEmbed(it.symbol, it.alert, name);
    await channel.send({ embeds: [embed] });
    if (MSG_DELAY_MS > 0) await new Promise((r) => setTimeout(r, MSG_DELAY_MS));
  }
}

async function botTick(client) {
  const set =
    BOT_UNIVERSE === "us"
      ? Universe.us
      : BOT_UNIVERSE === "binance"
      ? Universe.binance
      : Universe.all();
  const symbols = Array.from(set).slice(0, BOT_LIMIT);
  if (!symbols.length) return;

  const { period1, period2 } = buildDateRange({
    range: BOT_RANGE,
    days: undefined,
    interval: BOT_INTERVAL,
  });
  const opts = {
    interval: BOT_INTERVAL,
    period1,
    period2,
    fast: 12,
    slow: 26,
    signal: 9,
  };

  const results = await limitConcurrency(
    symbols,
    (s) => alertForSymbol(s, opts),
    6
  );
  const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);

  const toNotify = [];
  for (const r of results) {
    if (!r) continue;
    if (r.alert === "none") {
      lastAlertBySymbol.delete(r.symbol);
      continue;
    }
    // this is a test alert to show bot is running
    // if (results.indexOf(r) === 0) {
    //   toNotify.push({ symbol: "-----", alert: "-----" });
    //   continue;
    // }
    const last = lastAlertBySymbol.get(r.symbol);
    if (r.alert !== last) {
      toNotify.push(r);
      lastAlertBySymbol.set(r.symbol, r.alert);
    }
  }

  if (toNotify.length) {
    await sendDiscordMessages(channel, toNotify);
  }
}

export async function startDiscordBot() {
  if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID) {
    console.log(
      "Discord bot disabled (missing DISCORD_TOKEN or DISCORD_CHANNEL_ID)."
    );
    return;
  }
  if (!VALID_INTERVALS.has(BOT_INTERVAL)) {
    throw new Error(
      `BOT_INTERVAL '${BOT_INTERVAL}' invalid. Allowed: ${[
        ...VALID_INTERVALS,
      ].join(", ")}`
    );
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });
  client.once("ready", () => {
    console.log(`Discord bot logged in as ${client.user.tag}`);
  });
  await client.login(DISCORD_TOKEN);

  try {
    await botTick(client);
  } catch (e) {
    console.error("botTick initial error:", e);
  }
  setInterval(
    () => botTick(client).catch((e) => console.error("botTick error:", e)),
    BOT_INTERVAL_SEC * 1000
  );
}
