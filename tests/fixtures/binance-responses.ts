export const mockBinancePriceResponse = {
  symbol: 'BTCUSDT',
  price: '45000.50',
  time: 1705612800000,
};

export const mockBinancePriceResponseETH = {
  symbol: 'ETHUSDT',
  price: '2500.75',
  time: 1705612800000,
};

export const mockBinancePriceResponseBNB = {
  symbol: 'BNBUSDT',
  price: '350.25',
  time: 1705612800000,
};

export const mockBinanceErrorResponse = {
  code: -1121,
  msg: 'Invalid symbol.',
};

export const mockBinanceRateLimitResponse = {
  code: -1003,
  msg: 'Too many requests.',
};

export const mockBinanceServerErrorResponse = {
  code: -1000,
  msg: 'An unknown error occurred while processing the request.',
};

export const mockContractPrice = {
  symbol: 'BTCUSDT',
  price: 45000.5,
  timestamp: 1705612800000,
};

export const mockContractPriceETH = {
  symbol: 'ETHUSDT',
  price: 2500.75,
  timestamp: 1705612800000,
};

export const mockContractPriceBNB = {
  symbol: 'BNBUSDT',
  price: 350.25,
  timestamp: 1705612800000,
};

export const mockBatchResults = [
  {
    symbol: 'BTCUSDT',
    price: 45000.5,
    timestamp: 1705612800000,
  },
  {
    symbol: 'ETHUSDT',
    price: 2500.75,
    timestamp: 1705612800000,
  },
  {
    symbol: 'BNBUSDT',
    price: 350.25,
    timestamp: 1705612800000,
  },
];

export const mockBatchResultsWithError = [
  {
    symbol: 'BTCUSDT',
    price: 45000.5,
    timestamp: 1705612800000,
  },
  {
    symbol: 'INVALIDXXX',
    error: 'Invalid symbol: INVALIDXXX',
  },
];
