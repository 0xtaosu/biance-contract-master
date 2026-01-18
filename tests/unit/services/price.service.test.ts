import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceService } from '../../../src/services/price.service.js';
import { ValidationError } from '../../../src/utils/errors.js';
import { mockContractPrice, mockBatchResults } from '../../fixtures/binance-responses.js';

// Mock the binanceClient
vi.mock('../../../src/clients/binance.client.js', () => ({
  binanceClient: {
    getContractPrice: vi.fn(),
    getMultipleContractPrices: vi.fn(),
    checkConnection: vi.fn(),
  },
}));

// Import after mocking
import { binanceClient } from '../../../src/clients/binance.client.js';

describe('PriceService', () => {
  let priceService: PriceService;

  beforeEach(() => {
    priceService = new PriceService();
    vi.clearAllMocks();
  });

  describe('validateSymbol', () => {
    it('should validate correct symbols', () => {
      expect(() => priceService.validateSymbol('BTCUSDT')).not.toThrow();
      expect(() => priceService.validateSymbol('btcusdt')).not.toThrow();
      expect(() => priceService.validateSymbol('BTC')).not.toThrow();
      expect(() => priceService.validateSymbol('ETHUSDT123')).not.toThrow();
    });

    it('should throw ValidationError for empty symbol', () => {
      expect(() => priceService.validateSymbol('')).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-string symbol', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => priceService.validateSymbol(123 as any)).toThrow(ValidationError);
    });

    it('should throw ValidationError for symbols with special characters', () => {
      expect(() => priceService.validateSymbol('BTC-USDT')).toThrow(ValidationError);
      expect(() => priceService.validateSymbol('BTC_USDT')).toThrow(ValidationError);
      expect(() => priceService.validateSymbol('BTC/USDT')).toThrow(ValidationError);
    });

    it('should throw ValidationError for symbols that are too short', () => {
      expect(() => priceService.validateSymbol('B')).toThrow(ValidationError);
    });

    it('should throw ValidationError for symbols that are too long', () => {
      expect(() => priceService.validateSymbol('A'.repeat(21))).toThrow(ValidationError);
    });
  });

  describe('validateBatchSymbols', () => {
    it('should validate correct symbol arrays', () => {
      expect(() =>
        priceService.validateBatchSymbols(['BTCUSDT', 'ETHUSDT'])
      ).not.toThrow();
    });

    it('should throw ValidationError for non-array input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => priceService.validateBatchSymbols('BTCUSDT' as any)).toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for empty array', () => {
      expect(() => priceService.validateBatchSymbols([])).toThrow(ValidationError);
    });

    it('should throw ValidationError for arrays exceeding max symbols', () => {
      const symbols = Array(21).fill('BTCUSDT');
      expect(() => priceService.validateBatchSymbols(symbols)).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate symbols', () => {
      expect(() =>
        priceService.validateBatchSymbols(['BTCUSDT', 'btcusdt'])
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid symbols in array', () => {
      expect(() =>
        priceService.validateBatchSymbols(['BTCUSDT', 'INVALID-SYMBOL'])
      ).toThrow(ValidationError);
    });
  });

  describe('getPrice', () => {
    it('should fetch and return price for valid symbol', async () => {
      vi.mocked(binanceClient.getContractPrice).mockResolvedValue(mockContractPrice);

      const result = await priceService.getPrice('BTCUSDT');

      expect(result).toEqual(mockContractPrice);
      expect(binanceClient.getContractPrice).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should convert symbol to uppercase before fetching', async () => {
      vi.mocked(binanceClient.getContractPrice).mockResolvedValue(mockContractPrice);

      await priceService.getPrice('btcusdt');

      expect(binanceClient.getContractPrice).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should throw ValidationError for invalid symbol', async () => {
      await expect(priceService.getPrice('INVALID-SYMBOL')).rejects.toThrow(
        ValidationError
      );
      expect(binanceClient.getContractPrice).not.toHaveBeenCalled();
    });
  });

  describe('getBatchPrices', () => {
    it('should fetch prices for multiple symbols', async () => {
      vi.mocked(binanceClient.getMultipleContractPrices).mockResolvedValue(
        mockBatchResults
      );

      const result = await priceService.getBatchPrices(['BTCUSDT', 'ETHUSDT']);

      expect(result).toEqual(mockBatchResults);
      expect(binanceClient.getMultipleContractPrices).toHaveBeenCalledWith([
        'BTCUSDT',
        'ETHUSDT',
      ]);
    });

    it('should convert symbols to uppercase', async () => {
      vi.mocked(binanceClient.getMultipleContractPrices).mockResolvedValue(
        mockBatchResults
      );

      await priceService.getBatchPrices(['btcusdt', 'ethusdt']);

      expect(binanceClient.getMultipleContractPrices).toHaveBeenCalledWith([
        'BTCUSDT',
        'ETHUSDT',
      ]);
    });

    it('should throw ValidationError for invalid symbols array', async () => {
      await expect(priceService.getBatchPrices([])).rejects.toThrow(ValidationError);
      expect(binanceClient.getMultipleContractPrices).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for duplicate symbols', async () => {
      await expect(
        priceService.getBatchPrices(['BTCUSDT', 'btcusdt'])
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('checkHealth', () => {
    it('should return healthy status when Binance is connected', async () => {
      vi.mocked(binanceClient.checkConnection).mockResolvedValue(true);

      const result = await priceService.checkHealth();

      expect(result).toEqual({
        status: 'healthy',
        binanceConnected: true,
      });
    });

    it('should return degraded status when Binance is not connected', async () => {
      vi.mocked(binanceClient.checkConnection).mockResolvedValue(false);

      const result = await priceService.checkHealth();

      expect(result).toEqual({
        status: 'degraded',
        binanceConnected: false,
      });
    });
  });
});
