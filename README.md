# Binance Contract API

REST API service for querying Binance Futures contract prices.

## Features

- Fetch real-time prices for Binance Futures contracts
- Single symbol price queries
- Batch price queries (up to 20 symbols)
- Health check endpoint with Binance connectivity status
- Type-safe TypeScript implementation
- Comprehensive error handling
- Request validation with Zod
- Rate limiting protection
- Structured logging with Winston

## Web UI

A simple web interface is available in the `ui/` directory. See [ui/README.md](ui/README.md) for details.

**Quick Start:**
```bash
# Terminal 1: Start backend API
npm run dev

# Terminal 2: Start UI
cd ui
npm install
npm run dev
```

Visit `http://localhost:5173` to use the web interface.

## Tech Stack

**Backend:**
- **Framework**: Fastify 4.x
- **Language**: TypeScript
- **Binance Client**: @binance/connector-typescript (official SDK)
- **Validation**: Zod
- **Testing**: Vitest + nock
- **Logging**: Winston

**Frontend (ui/):**
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS (no framework)

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd biance-contract-master
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Optional: Only required for authenticated endpoints
BINANCE_API_KEY=
BINANCE_API_SECRET=

# Use testnet during development
BINANCE_TESTNET=true
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Building

Build the project:
```bash
npm run build
```

Run the production build:
```bash
npm start
```

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Watch mode for development:
```bash
npm run test:watch
```

## Code Quality

Run linter:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

Type checking:
```bash
npm run typecheck
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Health Check

**GET** `/health`

Check service health and Binance API connectivity.

**Response:**
```json
{
  "status": "healthy",
  "binanceConnected": true,
  "timestamp": 1705612800000
}
```

### Get Single Symbol Price

**GET** `/prices/:symbol`

Fetch current price for a single symbol.

**Parameters:**
- `symbol` (path): Trading pair symbol (e.g., BTCUSDT, ETHUSDT)

**Example:**
```bash
curl http://localhost:3000/api/v1/prices/BTCUSDT
```

**Response:**
```json
{
  "symbol": "BTCUSDT",
  "price": 45000.50,
  "timestamp": 1705612800000
}
```

### Get Batch Prices

**POST** `/prices/batch`

Fetch current prices for multiple symbols at once (max 20 symbols).

**Request Body:**
```json
{
  "symbols": ["BTCUSDT", "ETHUSDT", "BNBUSDT"]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/prices/batch \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["BTCUSDT", "ETHUSDT"]}'
```

**Response:**
```json
{
  "results": [
    {
      "symbol": "BTCUSDT",
      "price": 45000.50,
      "timestamp": 1705612800000
    },
    {
      "symbol": "ETHUSDT",
      "price": 2500.75,
      "timestamp": 1705612800000
    }
  ],
  "total": 2,
  "successful": 2,
  "failed": 0
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400): Invalid request parameters
- `INVALID_SYMBOL` (400): Invalid trading symbol format
- `RATE_LIMIT_ERROR` (429): Too many requests
- `BINANCE_API_ERROR` (502): Binance API returned an error
- `SERVICE_UNAVAILABLE` (503): Binance API is unavailable
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error

## Configuration

Environment variables are validated using envalid. See `.env.example` for all available options:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/test/production) | development |
| `PORT` | Server port | 3000 |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | info |
| `BINANCE_API_KEY` | Binance API key (optional for public endpoints) | - |
| `BINANCE_API_SECRET` | Binance API secret | - |
| `BINANCE_BASE_URL` | Binance API base URL | https://fapi.binance.com |
| `BINANCE_TESTNET` | Use Binance testnet | false |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per minute | 100 |
| `MAX_BATCH_SYMBOLS` | Max symbols in batch request | 20 |
| `REQUEST_TIMEOUT_MS` | API request timeout | 5000 |

## Project Structure

```
.
├── src/
│   ├── config/           # Environment and configuration
│   ├── clients/          # Binance API client wrapper
│   ├── services/         # Business logic
│   ├── routes/           # API route handlers
│   ├── schemas/          # Zod validation schemas
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions and custom errors
│   ├── app.ts            # Fastify application setup
│   └── server.ts         # Server entry point
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test fixtures
├── ui/                   # Web UI (React + Vite)
│   ├── src/              # UI source code
│   └── README.md         # UI documentation
├── docs/
│   └── decisions/        # Architecture Decision Records
└── dist/                 # Compiled JavaScript (git-ignored)
```

## Architecture Decisions

See [ADR-002](docs/decisions/ADR-002.md) for architectural decisions and rationale.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Ensure code is properly formatted: `npm run lint && npm run format`
6. Commit your changes
7. Create a pull request

## License

MIT
