async function fetchNasdaqLists() {
  const urls = [
    "https://old.nasdaqtrader.com/dynamic/symdir/nasdaqlisted.txt",
    "https://old.nasdaqtrader.com/dynamic/symdir/otherlisted.txt",
  ];
  const out = new Set();
  for (const url of urls) {
    const txt = await (await fetch(url)).text();
    const lines = txt.split(/\r?\n/);
    for (const line of lines) {
      if (
        !line ||
        line.startsWith("Symbol") ||
        line.startsWith("File Creation Time")
      )
        continue;
      const [sym] = line.split("|");
      if (sym && /^[A-Z.\-]+$/.test(sym)) out.add(sym.trim());
    }
  }
  return out;
}

function binanceToYahoo(sym) {
  if (!sym.endsWith("USDT") && !sym.endsWith("USDC") && !sym.endsWith("BUSD"))
    return null;
  const base = sym.replace(/(USDT|USDC|BUSD)$/, "");
  return `${base}-USD`;
}

async function fetchBinanceSpot() {
  const res = await (
    await fetch("https://api.binance.com/api/v3/exchangeInfo")
  ).json();
  const set = new Set();
  for (const s of res.symbols ?? []) {
    if (s.status !== "TRADING") continue;
    const mapped = binanceToYahoo(s.symbol);
    if (mapped) set.add(mapped);
  }
  return set;
}

const Universe = {
  us: new Set(),
  binance: new Set(),
  all() {
    return new Set([...this.us, ...this.binance]);
  },
};

async function bootstrapUniverse() {
  try {
    const [us, binance] = await Promise.all([
      fetchNasdaqLists().catch(() => new Set()),
      fetchBinanceSpot().catch(() => new Set()),
    ]);
    return { us, binance, all: new Set([...us, ...binance]) };
  } catch (e) {
    console.error("Universe bootstrap failed:", e);
    return { us: new Set(), binance: new Set(), all: new Set() };
  }
}

export { Universe, bootstrapUniverse };
