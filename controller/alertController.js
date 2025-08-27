import { bootstrapUniverse } from "../services/universeService.js";
import { normalizeInterval, buildDateRange } from "../utils/dateUtils.js";
import { fetchCandles } from "../services/yahooService.js";
import { SYMBOL_NAMES } from "../constants/marketSymbols.js";
import { computeMACD } from "../helper/index.js";
import { limitConcurrency } from "../utils/concurrency.js";
import { VALID_INTERVALS } from "../constants/IntervalRange.js";
import {
  findRecentCross,
  slopeConfirm,
  zeroLineConfirm,
  isBarClosed,
} from "../utils/crossedDetection.js";
const EPS = 1e-8;

export async function alertForSymbol(
  symbol,
  {
    interval,
    period1,
    period2,
    fast = 12,
    slow = 26,
    signal = 9,
    lookbackBars = 1, // NEW: catch crosses that happened 1 bar ago
    requireClosedBar = true, // NEW: ignore still-forming last candle
    useZeroLine = false, // toggle this for higher-quality but fewer signals
  }
) {
  try {
    const candles = await fetchCandles(symbol, interval, period1, period2);
    if (!Array.isArray(candles) || candles.length < slow + signal) {
      return { symbol, alert: "none" };
    }

    // Optionally drop the last candle if it's not aligned (still forming)
    const lastCandle = candles[candles.length - 1];
    const usable =
      requireClosedBar && !isBarClosed(lastCandle.time, interval)
        ? candles.slice(0, -1)
        : candles;

    const macd = computeMACD(usable, fast, slow, signal);
    if (macd.length < 2) return { symbol, alert: "none" };

    // Look for a recent cross within the chosen window (default 1 bar)
    const { dir, idx } = findRecentCross(macd, lookbackBars, EPS);
    if (!dir) return { symbol, alert: "none" };

    // Use the two points at the cross index for slope & zero-line checks
    const prev = macd[idx - 1];
    const last = macd[idx];

    const slopeOk = slopeConfirm(prev.macd, last.macd, dir, EPS);
    const zeroOk = useZeroLine ? zeroLineConfirm(last.macd, dir, EPS) : true;

    if (dir === "up" && slopeOk && zeroOk) return { symbol, alert: "bullish" };
    if (dir === "down" && slopeOk && zeroOk)
      return { symbol, alert: "bearish" };
    return { symbol, alert: "none" };
  } catch {
    return { symbol, alert: "none" };
  }
}

export async function alertController(req, res) {
  try {
    const universe = await bootstrapUniverse();
    const interval = normalizeInterval(req.query.interval);
    if (!VALID_INTERVALS.has(interval)) {
      return res.status(400).json({
        error: `Invalid interval '${interval}'`,
        valid: [...VALID_INTERVALS],
      });
    }

    const universeKey = String(req.query.universe ?? "imp").toLowerCase();
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
          ? universe.us
          : universeKey === "binance"
          ? universe.binance
          : universeKey === "imp"
          ? universe.imp
          : universe.all;
      symbols = Array.from(set);
    }

    if (!symbols.length) {
      return res
        .status(503)
        .json({ error: "Universe not loaded yet. Try again shortly." });
    }

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

    const data = results.filter(Boolean).map((r) => ({
      symbol: r.symbol,
      name: SYMBOL_NAMES[r.symbol] || r.symbol,
      alert: r.alert,
    }));

    res.json({
      universe: universeKey,
      count: data.length,
      nextCursor:
        cursor + page.length < symbols.length ? cursor + page.length : null,
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? "Unknown error" });
  }
}
