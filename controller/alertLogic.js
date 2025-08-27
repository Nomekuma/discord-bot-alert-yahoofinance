import { computeMACD } from "../helper/index.js";

const DEFAULT_EPS = 1e-8;

// Pure function: given candles and MACD params, decide alert based on immediate last-bar cross.
export function evaluateMACDAlert(candles, { fast, slow, signal, eps = DEFAULT_EPS } = {}) {
  if (!Array.isArray(candles) || candles.length < slow + signal) {
    return { alert: "none", reason: "insufficient_candles" };
  }
  const macd = computeMACD(candles, fast, slow, signal);
  if (macd.length < 2) return { alert: "none", reason: "macd_too_short" };
  const prev = macd[macd.length - 2];
  const curr = macd[macd.length - 1];
  const prevDiff = prev.macd - prev.signal;
  const currDiff = curr.macd - curr.signal;
  if (prevDiff < -eps && currDiff > eps) return { alert: "bullish" };
  if (prevDiff > eps && currDiff < -eps) return { alert: "bearish" };
  return { alert: "none" };
}
