const FOREX_PAIRS = [
  "XAUUSD=X", // Spot Gold (Forex style)
  "AUDUSD=X", // AUD/USD
  "USDJPY=X", // USD/JPY
  "GBPUSD=X", // GBP/USD
  "EURUSD=X", // EUR/USD
  "EURJPY=X", // EUR/JPY
  "EURGBP=X", // EUR/GBP
  "USDCHF=X",
  "USDCAD=X",
  "NZDUSD=X",
  "GBPJPY=X",
  "EURCHF=X",
  "EURCAD=X",
  "EURAUD=X",
  "AUDJPY=X",
  "CHFJPY=X",
];

const COMMODITIES = [
  "GC=F", // Gold Futures
  "XAUUSD=X", // Spot Gold (Forex style, for completeness)
  "^DJI", // Wall Street Cash (Dow Jones Index)
  "SI=F", // Silver
  "CL=F", // Crude Oil WTI
  "BZ=F", // Brent Crude Oil
  "NG=F", // Natural Gas
  "PL=F", // Platinum
  "HG=F", // Copper
  "PA=F", // Palladium
  "ZC=F", // Corn
  "ZS=F", // Soybeans
  "ZW=F", // Wheat
  "KC=F", // Coffee
  "CC=F", // Cocoa
  "CT=F", // Cotton
  "SB=F", // Sugar
];

const SYMBOL_NAMES = {
  "XAUUSD=X": "Spot Gold",
  "AUDUSD=X": "AUD/USD",
  "USDJPY=X": "USD/JPY",
  "GBPUSD=X": "GBP/USD",
  "EURUSD=X": "EUR/USD",
  "EURJPY=X": "EUR/JPY",
  "EURGBP=X": "EUR/GBP",
  "USDCHF=X": "USD/CHF",
  "USDCAD=X": "USD/CAD",
  "NZDUSD=X": "NZD/USD",
  "GBPJPY=X": "GBP/JPY",
  "EURCHF=X": "EUR/CHF",
  "EURCAD=X": "EUR/CAD",
  "EURAUD=X": "EUR/AUD",
  "AUDJPY=X": "AUD/JPY",
  "CHFJPY=X": "CHF/JPY",
  "GC=F": "Gold Futures",
  "^DJI": "Dow Jones Index",
  "SI=F": "Silver",
  "CL=F": "Crude Oil WTI",
  "BZ=F": "Brent Crude Oil",
  "NG=F": "Natural Gas",
  "PL=F": "Platinum",
  "HG=F": "Copper",
  "PA=F": "Palladium",
  "ZC=F": "Corn",
  "ZS=F": "Soybeans",
  "ZW=F": "Wheat",
  "KC=F": "Coffee",
  "CC=F": "Cocoa",
  "CT=F": "Cotton",
  "SB=F": "Sugar",
};

export { FOREX_PAIRS, COMMODITIES, SYMBOL_NAMES };
