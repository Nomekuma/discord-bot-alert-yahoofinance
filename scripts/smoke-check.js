import { fetchCandles } from "../services/yahooService.js";
import { computeMACD } from "../helper/MACD.js";
import { alertForSymbol } from "../controller/alertController.js";

const argv = process.argv.slice(2);
const symbol = argv[0] || "GC=F";
const interval = argv[1] || "10m";
const hours = Number(argv[2] || 24);

(async function run() {
  const end = new Date();
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
  console.log(
    `Smoke check: ${symbol} ${interval} from ${start.toISOString()} to ${end.toISOString()}`
  );
  try {
    const candles = await fetchCandles(
      symbol,
      interval,
      start.toISOString(),
      end.toISOString()
    );
    if (!Array.isArray(candles))
      throw new Error("fetchCandles returned non-array");
    console.log("candles fetched:", candles.length);
    console.log("sample first 10:", candles.slice(0, 10));
    if (candles.length === 0) throw new Error("no candles fetched");
    if (candles.length < 2) throw new Error("not enough candles fetched");
    if (
      !candles.every(
        (c) =>
          c &&
          c.time &&
          typeof c.open === "number" &&
          typeof c.high === "number" &&
          typeof c.low === "number" &&
          typeof c.close === "number"
      )
    ) {
      throw new Error("invalid candle data");
    }
    // Compute MACD to validate data integrity
    const macd = computeMACD(candles);
    console.log("macd length:", macd.length);
    console.log("macd tail:", macd.slice(-3));
    // Run alert logic for the same symbol/interval to validate end-to-end
    try {
      const alert = await alertForSymbol(symbol, {
        interval,
        period1: start.toISOString(),
        period2: end.toISOString(),
      });
      console.log("alert result:", alert);
    } catch (ae) {
      console.error(
        "alert check failed:",
        ae && ae.stack ? ae.stack : ae.message
      );
    }

    console.log("Smoke check succeeded");
    process.exit(0);
  } catch (err) {
    console.error(
      "Smoke check failed:",
      err && err.stack ? err.stack : err.message
    );
    process.exit(2);
  }
})();
