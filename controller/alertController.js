import { Universe } from "../services/universeService.js";
import { bootstrapUniverse } from "../services/universeService.js";
import { normalizeInterval, buildDateRange } from "../utils/dateUtils.js";
import { fetchCandles } from "../services/yahooService.js";
import { computeMACD } from "../helper/MACD.js";
import { limitConcurrency } from "../utils/concurrency.js";

const VALID_INTERVALS = new Set(["1d", "60m", "1wk", "1mo"]); // Add more as needed

export async function alertForSymbol(
  symbol,
  { interval, period1, period2, fast = 12, slow = 26, signal = 9 }
) {
  try {
    const candles = await fetchCandles(symbol, interval, period1, period2);
    if (candles.length < slow + signal) return { symbol, alert: "none" };
    const macd = computeMACD(candles, fast, slow, signal);
    if (macd.length < 2) return { symbol, alert: "none" };
    const prev = macd[macd.length - 2],
      last = macd[macd.length - 1];
    if (prev.macd < prev.signal && last.macd > last.signal)
      return { symbol, alert: "bullish" };
    if (prev.macd > prev.signal && last.macd < last.signal)
      return { symbol, alert: "bearish" };
    return { symbol, alert: "none" };
  } catch {
    return { symbol, alert: "none" };
  }
}

export async function alertController(req, res) {
  try {
    await bootstrapUniverse();
    const interval = normalizeInterval(req.query.interval);
    if (!VALID_INTERVALS.has(interval)) {
      return res.status(400).json({
        error: `Invalid interval '${interval}'`,
        valid: [...VALID_INTERVALS],
      });
    }
    const universeKey = String(req.query.universe ?? "all").toLowerCase();
    const limit = Math.max(1, Math.min(Number(req.query.limit ?? 100), 500));
    const cursor = Math.max(0, Number(req.query.cursor ?? 0));
    let symbols;
    if (req.query.symbols) {
      const raw = Array.isArray(req.query.symbols)
        ? req.query.symbols.join(",")
        : String(req.query.symbols);
      symbols = [
        ...new Set(
          raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        ),
      ];
    } else {
      const set =
        universeKey === "us"
          ? Universe.us
          : universeKey === "binance"
          ? Universe.binance
          : Universe.all();
      symbols = Array.from(set);
    }
    if (!symbols.length)
      return res
        .status(503)
        .json({ error: "Universe not loaded yet. Try again shortly." });
    const page = symbols.slice(cursor, cursor + limit);
    const { period1, period2 } = buildDateRange({
      range: req.query.range ?? req.query.period,
      days: req.query.days,
      interval,
    });
    const fast = Number(req.query.fast ?? 12);
    const slow = Number(req.query.slow ?? 26);
    const signal = Number(req.query.signal ?? 9);
    const opts = { interval, period1, period2, fast, slow, signal };
    const results = await limitConcurrency(
      page,
      (sym) => alertForSymbol(sym, opts),
      6
    );
    res.json({
      universe: universeKey,
      count: results.filter(Boolean).length,
      nextCursor:
        cursor + page.length < symbols.length ? cursor + page.length : null,
      data: results.filter(Boolean),
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? "Unknown error" });
  }
}
