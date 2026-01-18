import { env } from './env.js';

export interface BinanceConfig {
  apiKey: string;
  apiSecret: string;
  baseURL: string;
  timeout: number;
  isTestnet: boolean;
}

export const binanceConfig: BinanceConfig = {
  apiKey: env.BINANCE_API_KEY,
  apiSecret: env.BINANCE_API_SECRET,
  baseURL: env.BINANCE_TESTNET
    ? 'https://testnet.binancefuture.com'
    : env.BINANCE_BASE_URL,
  timeout: env.REQUEST_TIMEOUT_MS,
  isTestnet: env.BINANCE_TESTNET,
};
