// API Response Types (matching backend schemas)

export interface ContractPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface BatchPriceResult {
  symbol: string;
  price?: number;
  timestamp?: number;
  error?: string;
}

export interface BatchPriceResponse {
  results: BatchPriceResult[];
  total: number;
  successful: number;
  failed: number;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  binanceConnected: boolean;
  timestamp: number;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Request Types
export interface BatchPriceRequest {
  symbols: string[];
}
