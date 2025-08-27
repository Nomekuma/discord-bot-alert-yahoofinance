import { bootstrapUniverse } from "../services/universeService.js";
import { normalizeInterval, buildDateRange } from "../utils/dateUtils.js";
import { fetchCandles } from "../services/yahooService.js";
import { SYMBOL_NAMES } from "../constants/marketSymbols.js";
import { computeMACD } from "../helper/index.js"; // still used indirectly by logic helper
import { limitConcurrency } from "../utils/concurrency.js";
import { VALID_INTERVALS } from "../constants/IntervalRange.js";
import { evaluateMACDAlert } from "./alertLogic.js";

const EPS = 1e-8;

export async function alertForSymbol(
  symbol,
  { interval, period1, period2, fast = 12, slow = 26, signal = 9 }
) {
  try {
    const candles = await fetchCandles(symbol, interval, period1, period2);
    if (!Array.isArray(candles) || candles.length < slow + signal) {
      return { symbol, alert: "none" };
    }
    const { alert } = evaluateMACDAlert(candles, {
      fast,
      slow,
      signal,
      eps: EPS,
    });
    return { symbol, alert };
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
