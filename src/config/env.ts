import { cleanEnv, str, num, bool, url } from 'envalid';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production'],
    default: 'development',
  }),
  PORT: num({ default: 3000 }),
  LOG_LEVEL: str({
    choices: ['error', 'warn', 'info', 'debug'],
    default: 'info',
  }),

  // Binance API configuration
  BINANCE_API_KEY: str({ default: '' }),
  BINANCE_API_SECRET: str({ default: '' }),
  BINANCE_BASE_URL: url({ default: 'https://fapi.binance.com' }),
  BINANCE_TESTNET: bool({ default: false }),

  // API configuration
  RATE_LIMIT_MAX_REQUESTS: num({ default: 100 }),
  MAX_BATCH_SYMBOLS: num({ default: 20 }),
  REQUEST_TIMEOUT_MS: num({ default: 5000 }),
});
