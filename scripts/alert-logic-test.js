import { evaluateMACDAlert } from "../controller/alertLogic.js";

function genCandles(closes) {
  const start = Date.now() - closes.length * 60000;
  return closes.map((c, i) => ({
    time: new Date(start + i * 60000),
    open: c,
    high: c,
    low: c,
    close: c,
    volume: 0,
  }));
}

function assert(cond, msg) {
  if (!cond) {
    console.error("❌", msg);
    process.exit(1);
  }
  console.log("✅", msg);
}

// Use very small MACD periods to keep synthetic data short
const fast = 2,
  slow = 4,
  signal = 2;

// Scenario 1: Bullish cross (only at final bar)
// Keep MACD diff negative until the penultimate bar, then spike.
const bullishCandles = genCandles([10, 10, 10, 10, 9.8, 9.7, 9.6, 9.5, 10.8]);
const bullRes = evaluateMACDAlert(bullishCandles, { fast, slow, signal });
console.log("Bullish test result:", bullRes);
assert(bullRes.alert === "bullish", "Bullish cross detected");

// Scenario 2: Bearish cross (only at final bar)
// Keep diff positive until final bar then drop.
const bearishCandles = genCandles([
  12, 12, 12, 12, 12.2, 12.3, 12.4, 12.5, 11.2,
]);
const bearRes = evaluateMACDAlert(bearishCandles, { fast, slow, signal });
console.log("Bearish test result:", bearRes);
assert(bearRes.alert === "bearish", "Bearish cross detected");

// Scenario 3: No cross (steady uptrend without opposite sign flip)
const noneCandles = genCandles([5, 6, 7, 8, 9, 10, 11, 12]);
const noneRes = evaluateMACDAlert(noneCandles, { fast, slow, signal });
console.log("None test result:", noneRes);
assert(noneRes.alert === "none", "No cross returns none");

// Scenario 4: Insufficient candles (< slow+signal)
const shortCandles = genCandles([1, 2, 3, 4, 5]);
const shortRes = evaluateMACDAlert(shortCandles, { fast, slow, signal });
console.log("Short test result:", shortRes);
assert(shortRes.alert === "none", "Insufficient candles yields none");

console.log("\n🎯 All alert logic tests passed");
process.exit(0);
