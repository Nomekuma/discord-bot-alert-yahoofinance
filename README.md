# ynfiance-freelance-bot

A Node.js-based alerting bot for financial markets, designed to analyze symbols (stocks, crypto, etc.) using technical indicators (MACD, EMA) and provide actionable alerts via a REST API and Discord integration.

## Features

- **Symbol Alerts:** Detects bullish/bearish signals for a universe of symbols using MACD.
- **Customizable Parameters:** Supports custom intervals, date ranges, and indicator settings.
- **Universe Support:** Works with US stocks, Binance symbols, or a custom list.
- **Concurrency Control:** Efficiently processes large symbol lists with concurrency limits.
- **Discord Integration:** (See `discord/discordBot.js`) Sends alerts to Discord channels.

## Project Structure

```
app.js                  # Main entry point
controller/
	alertController.js    # REST API controller for alerts
discord/
	discordBot.js         # Discord bot integration
helper/
	EMA.js, MACD.js       # Technical indicator calculations
services/
	universeService.js    # Symbol universe management
	yahooService.js       # Candle data fetching (Yahoo Finance)
utils/
	concurrency.js        # Concurrency limiting helpers
	dateUtils.js          # Date and interval utilities
constants/              # Interval and other constants
routes/                 # Express route definitions
```

## Getting Started

### Prerequisites
- Node.js v16+
- npm

### Installation

```bash
npm install
```

### Running the Bot

```bash
node app.js
```

### API Usage

#### Alert Endpoint

```
GET /alerts
```

**Query Parameters:**
- `interval` (string): Candle interval (e.g., `1d`, `60m`, `1wk`, `1mo`)
- `universe` (string): `us`, `binance`, or `all` (default: `all`)
- `symbols` (string): Comma-separated list of symbols (optional)
- `limit` (number): Max symbols per request (default: 100, max: 500)
- `cursor` (number): Pagination cursor (default: 0)
- `range`/`period` (string): Date range (e.g., `1mo`, `3mo`)
- `days` (number): Number of days for the range (optional)
- `fast`, `slow`, `signal` (number): MACD parameters (optional)

**Example:**
```
GET /alerts?interval=1d&universe=us&limit=50
```

**Response:**
```json
{
	"universe": "us",
	"count": 50,
	"nextCursor": 50,
	"data": [
		{ "symbol": "AAPL", "alert": "bullish" },
		{ "symbol": "TSLA", "alert": "none" },
		...
	]
}
```

### Discord Alerts
- Configure your Discord bot in `discord/discordBot.js`.
- Set up your Discord token and channel IDs as needed.

## Technical Details
- **MACD Calculation:** See `helper/MACD.js` for implementation.
- **Universe Management:** See `services/universeService.js`.
- **Candle Data:** Fetched from Yahoo Finance via `services/yahooService.js`.

## Contributing
Pull requests and issues are welcome!

## License
MIT