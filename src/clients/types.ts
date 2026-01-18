export interface BinanceTickerPrice {
  symbol: string;
  price: string;
  time: number;
}

export interface ContractPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface BinancePriceResponse {
  symbol: string;
  price: string;
  time?: number;
}

export interface BatchPriceResult {
  symbol: string;
  price?: number;
  timestamp?: number;
  error?: string;
}
