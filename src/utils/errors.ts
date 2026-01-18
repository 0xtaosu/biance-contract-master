export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class BinanceAPIError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('BINANCE_API_ERROR', message, 502, details);
    this.name = 'BinanceAPIError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', details?: Record<string, unknown>) {
    super('RATE_LIMIT_ERROR', message, 429, details);
    this.name = 'RateLimitError';
  }
}

export class InvalidSymbolError extends AppError {
  constructor(symbol: string) {
    super('INVALID_SYMBOL', `Invalid symbol: ${symbol}`, 400, { symbol });
    this.name = 'InvalidSymbolError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', details?: Record<string, unknown>) {
    super('SERVICE_UNAVAILABLE', message, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}
