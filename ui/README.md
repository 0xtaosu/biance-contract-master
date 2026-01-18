# Binance Contract UI

Simple web interface for querying Binance Futures contract prices.

## Features

- **Health Status**: Real-time display of API and Binance connection status
- **Single Price Checker**: Look up price for individual trading symbols
- **Batch Price Viewer**: Display prices for multiple symbols simultaneously

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend API running on http://localhost:3000

## Installation

1. Navigate to the ui directory:
```bash
cd ui
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create environment configuration:
```bash
cp .env.example .env
```

## Development

Start the development server:
```bash
npm run dev
```

The UI will be available at `http://localhost:5173`

## Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Configuration

Environment variables (optional):

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api/v1` |

## Usage

### Single Price Checker
1. Enter a trading symbol (e.g., BTCUSDT, ETHUSDT)
2. Click "Get Price"
3. View the current price and timestamp

### Batch Price Viewer
1. Enter multiple symbols separated by commas
2. Click "Get Prices"
3. View all prices in a table format

### Health Status
- Automatically checks API health every 30 seconds
- Displays connection status to Binance API
- Shows last update timestamp

## Tech Stack

- React 18
- TypeScript
- Vite
- CSS (no UI framework)

## API Integration

The UI connects to the backend API with the following endpoints:

- `GET /health` - System health check
- `GET /api/v1/prices/:symbol` - Single symbol price
- `POST /api/v1/prices/batch` - Batch symbol prices

## Project Structure

```
ui/
├── src/
│   ├── components/       # React components
│   │   ├── HealthStatus.tsx
│   │   ├── SinglePriceChecker.tsx
│   │   └── BatchPriceViewer.tsx
│   ├── services/         # API client
│   │   └── api.ts
│   ├── types/            # TypeScript interfaces
│   │   └── api.ts
│   ├── App.tsx           # Main app component
│   ├── App.css           # Styles
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies
```

## Troubleshooting

**Connection Error**: Ensure the backend API is running on `http://localhost:3000`

**CORS Error**: The backend should have CORS configured to allow requests from `http://localhost:5173`

**Port Conflict**: If port 5173 is in use, Vite will automatically try the next available port

## License

MIT
