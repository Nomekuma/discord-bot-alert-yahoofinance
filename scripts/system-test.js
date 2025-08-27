// Comprehensive system test
import { fetchCandles } from "../services/yahooService.js";
import { alertForSymbol } from "../controller/alertController.js";
import { bootstrapUniverse } from "../services/universeService.js";
import { buildDateRange, normalizeInterval } from "../utils/dateUtils.js";
import { createAlertEmbed } from "../discord/embedTemplate.js";
import { SYMBOL_NAMES } from "../constants/marketSymbols.js";

async function testYahooService() {
  console.log("\n=== Testing Yahoo Finance Service ===");

  try {
    // Test with a forex pair
    const symbol = "EURUSD=X";
    const interval = "1h";
    const period1 = "2025-08-20";
    const period2 = "2025-08-27";

    console.log(`Fetching candles for ${symbol}...`);
    const candles = await fetchCandles(symbol, interval, period1, period2);

    console.log(`✅ Fetched ${candles.length} candles`);
    console.log(`First candle:`, candles[0]);
    console.log(`Last candle:`, candles[candles.length - 1]);

    if (candles.length < 10) {
      console.log("⚠️  Warning: Low number of candles fetched");
    }

    return candles;
  } catch (error) {
    console.error("❌ Yahoo service test failed:", error.message);
    return null;
  }
}

async function testAlertController(candles) {
  console.log("\n=== Testing Alert Controller ===");

  if (!candles || candles.length < 50) {
    console.log("⚠️  Skipping alert test - insufficient candle data");
    return;
  }

  try {
    const symbol = "EURUSD=X";
    const opts = {
      interval: "1h",
      period1: "2025-08-20",
      period2: "2025-08-27",
      fast: 12,
      slow: 26,
      signal: 9,
      lookbackBars: 1,
      requireClosedBar: false,
      useZeroLine: false
    };

    console.log(`Testing alert detection for ${symbol}...`);
    const result = await alertForSymbol(symbol, opts);

    console.log(`✅ Alert result:`, result);

    if (result.alert !== "none") {
      console.log(`🎯 Detected ${result.alert} signal!`);
    } else {
      console.log("📊 No alert detected (normal for most time periods)");
    }

    return result;
  } catch (error) {
    console.error("❌ Alert controller test failed:", error.message);
    return null;
  }
}

async function testUniverseService() {
  console.log("\n=== Testing Universe Service ===");

  try {
    console.log("Bootstrapping universe...");
    const universe = await bootstrapUniverse();

    console.log("✅ Universe loaded:");
    console.log(`   US stocks: ${universe.us.size} symbols`);
    console.log(`   Binance: ${universe.binance.size} symbols`);
    console.log(`   Forex: ${universe.forex.size} symbols`);
    console.log(`   Commodities: ${universe.commodities.size} symbols`);
    console.log(`   Total: ${universe.all.size} symbols`);

    // Show some examples
    const forexArray = Array.from(universe.forex);
    const commoditiesArray = Array.from(universe.commodities);

    console.log("\n📈 Forex examples:", forexArray.slice(0, 5));
    console.log("🛢️  Commodities examples:", commoditiesArray.slice(0, 5));

    return universe;
  } catch (error) {
    console.error("❌ Universe service test failed:", error.message);
    return null;
  }
}

function testDateUtils() {
  console.log("\n=== Testing Date Utilities ===");

  try {
    // Test interval normalization
    const intervals = ["1m", "5m", "10m", "1h", "1d", "1wk"];
    console.log("Interval normalization:");
    intervals.forEach(interval => {
      const normalized = normalizeInterval(interval);
      console.log(`   ${interval} → ${normalized}`);
    });

    // Test date range building
    const dateRange = buildDateRange({
      range: "1mo",
      interval: "1h"
    });

    console.log("✅ Date range for 1mo:", {
      period1: dateRange.period1,
      period2: dateRange.period2
    });

    return true;
  } catch (error) {
    console.error("❌ Date utils test failed:", error.message);
    return false;
  }
}

function testDiscordEmbed() {
  console.log("\n=== Testing Discord Embed Creation ===");

  try {
    const testCases = [
      { symbol: "EURUSD=X", alert: "bullish", name: "EUR/USD" },
      { symbol: "GC=F", alert: "bearish", name: "Gold Futures" },
      { symbol: "AAPL", alert: "none", name: "Apple Inc." }
    ];

    testCases.forEach((testCase, index) => {
      const embed = createAlertEmbed(testCase.symbol, testCase.alert, testCase.name);
      console.log(`✅ Embed ${index + 1} created for ${testCase.alert} alert`);
      console.log(`   Title: ${embed.data.title}`);
      console.log(`   Color: ${embed.data.color}`);
      console.log(`   Fields: ${embed.data.fields?.length || 0}`);
    });

    return true;
  } catch (error) {
    console.error("❌ Discord embed test failed:", error.message);
    return false;
  }
}

async function testSymbolNames() {
  console.log("\n=== Testing Symbol Names ===");

  try {
    const testSymbols = ["EURUSD=X", "GC=F", "AAPL", "UNKNOWN"];
    testSymbols.forEach(symbol => {
      const name = SYMBOL_NAMES[symbol] || symbol;
      console.log(`   ${symbol} → ${name}`);
    });

    console.log(`✅ Symbol names mapping working (${Object.keys(SYMBOL_NAMES).length} symbols mapped)`);
    return true;
  } catch (error) {
    console.error("❌ Symbol names test failed:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting comprehensive system tests...\n");

  const results = {
    yahooService: false,
    alertController: false,
    universeService: false,
    dateUtils: false,
    discordEmbed: false,
    symbolNames: false
  };

  // Test basic utilities first
  results.dateUtils = testDateUtils();
  results.discordEmbed = testDiscordEmbed();
  results.symbolNames = testSymbolNames();

  // Test data services
  results.universeService = !!(await testUniverseService());

  // Test Yahoo service and alert controller
  const candles = await testYahooService();
  results.yahooService = !!candles;

  if (candles) {
    results.alertController = !!(await testAlertController(candles));
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${test}`);
  });

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("🎉 All tests passed! System is ready.");
  } else {
    console.log("⚠️  Some tests failed. Check the output above.");
  }

  return passed === total;
}

// Run tests
runAllTests().catch((error) => {
  console.error("💥 Test suite crashed:", error);
  process.exit(1);
});
