import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../../../src/app.js';
import type { FastifyInstance } from 'fastify';
import { mockContractPrice, mockBatchResults } from '../../fixtures/binance-responses.js';

// Mock the binanceClient
vi.mock('../../../src/clients/binance.client.js', () => ({
  binanceClient: {
    getContractPrice: vi.fn(),
    getMultipleContractPrices: vi.fn(),
    checkConnection: vi.fn(),
  },
}));

import { binanceClient } from '../../../src/clients/binance.client.js';

describe('Price Routes Integration Tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/health', () => {
    it('should return healthy status when Binance is connected', async () => {
      vi.mocked(binanceClient.checkConnection).mockResolvedValue(true);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        status: 'healthy',
        binanceConnected: true,
      });
      expect(body.timestamp).toBeDefined();
    });

    it('should return degraded status when Binance is not connected', async () => {
      vi.mocked(binanceClient.checkConnection).mockResolvedValue(false);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        status: 'degraded',
        binanceConnected: false,
      });
    });
  });

  describe('GET /api/v1/prices/:symbol', () => {
    it('should return price for valid symbol', async () => {
      vi.mocked(binanceClient.getContractPrice).mockResolvedValue(mockContractPrice);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/prices/BTCUSDT',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockContractPrice);
    });

    it('should handle lowercase symbols', async () => {
      vi.mocked(binanceClient.getContractPrice).mockResolvedValue(mockContractPrice);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/prices/btcusdt',
      });

      expect(response.statusCode).toBe(200);
      expect(binanceClient.getContractPrice).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should return 400 for invalid symbol', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/prices/INVALID-SYMBOL',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for symbol that is too short', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/prices/B',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/prices/batch', () => {
    it('should return prices for multiple symbols', async () => {
      vi.mocked(binanceClient.getMultipleContractPrices).mockResolvedValue(
        mockBatchResults
      );

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/prices/batch',
        payload: {
          symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.results).toEqual(mockBatchResults);
      expect(body.total).toBe(3);
      expect(body.successful).toBe(3);
      expect(body.failed).toBe(0);
    });

    it('should handle lowercase symbols', async () => {
      vi.mocked(binanceClient.getMultipleContractPrices).mockResolvedValue(
        mockBatchResults
      );

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/prices/batch',
        payload: {
          symbols: ['btcusdt', 'ethusdt'],
        },
      });

      expect(response.statusCode).toBe(200);
      expect(binanceClient.getMultipleContractPrices).toHaveBeenCalledWith([
        'BTCUSDT',
        'ETHUSDT',
      ]);
    });

    it('should return 400 for empty symbols array', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/prices/batch',
        payload: {
          symbols: [],
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for too many symbols', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/prices/batch',
        payload: {
          symbols: Array(21).fill('BTCUSDT'),
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for duplicate symbols', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/prices/batch',
        payload: {
          symbols: ['BTCUSDT', 'btcusdt'],
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid symbols in array', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/prices/batch',
        payload: {
          symbols: ['BTCUSDT', 'INVALID-SYMBOL'],
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing symbols field', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/prices/batch',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle partial failures in batch', async () => {
      const resultsWithError = [
        {
          symbol: 'BTCUSDT',
          price: 45000.5,
          timestamp: 1705612800000,
        },
        {
          symbol: 'INVALIDXXX',
          error: 'Some error',
        },
      ];

      vi.mocked(binanceClient.getMultipleContractPrices).mockResolvedValue(
        resultsWithError
      );

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/prices/batch',
        payload: {
          symbols: ['BTCUSDT', 'INVALIDXXX'],
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.successful).toBe(1);
      expect(body.failed).toBe(1);
    });
  });

  describe('Root endpoint', () => {
    it('should return API information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.name).toBe('Binance Contract API');
      expect(body.endpoints).toBeDefined();
    });
  });
});
