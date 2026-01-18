import { binanceClient } from '../clients/binance.client.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';
import type { ContractPrice, BatchPriceResult } from '../clients/types.js';

export class PriceService {
  private readonly SYMBOL_REGEX = /^[A-Z0-9]+$/;

  validateSymbol(symbol: string): void {
    if (!symbol || typeof symbol !== 'string') {
      throw new ValidationError('Symbol must be a non-empty string', { symbol });
    }

    const upperSymbol = symbol.toUpperCase();

    if (!this.SYMBOL_REGEX.test(upperSymbol)) {
      throw new ValidationError(
        'Symbol must contain only uppercase letters and numbers',
        { symbol }
      );
    }

    if (upperSymbol.length < 2 || upperSymbol.length > 20) {
      throw new ValidationError('Symbol must be between 2 and 20 characters', { symbol });
    }
  }

  validateBatchSymbols(symbols: string[]): void {
    if (!Array.isArray(symbols)) {
      throw new ValidationError('Symbols must be an array');
    }

    if (symbols.length === 0) {
      throw new ValidationError('Symbols array cannot be empty');
    }

    if (symbols.length > env.MAX_BATCH_SYMBOLS) {
      throw new ValidationError(
        `Cannot request more than ${env.MAX_BATCH_SYMBOLS} symbols at once`,
        { provided: symbols.length, max: env.MAX_BATCH_SYMBOLS }
      );
    }

    symbols.forEach((symbol, index) => {
      try {
        this.validateSymbol(symbol);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(
            `Invalid symbol at index ${index}: ${error.message}`,
            { index, symbol, originalError: error.details }
          );
        }
        throw error;
      }
    });

    // Check for duplicates
    const uniqueSymbols = new Set(symbols.map((s) => s.toUpperCase()));
    if (uniqueSymbols.size !== symbols.length) {
      throw new ValidationError('Duplicate symbols are not allowed', {
        provided: symbols.length,
        unique: uniqueSymbols.size,
      });
    }
  }

  async getPrice(symbol: string): Promise<ContractPrice> {
    this.validateSymbol(symbol);

    const upperSymbol = symbol.toUpperCase();

    logger.info('Fetching price for symbol', { symbol: upperSymbol });

    const price = await binanceClient.getContractPrice(upperSymbol);

    return price;
  }

  async getBatchPrices(symbols: string[]): Promise<BatchPriceResult[]> {
    this.validateBatchSymbols(symbols);

    const upperSymbols = symbols.map((s) => s.toUpperCase());

    logger.info('Fetching batch prices', {
      count: upperSymbols.length,
      symbols: upperSymbols,
    });

    const results = await binanceClient.getMultipleContractPrices(upperSymbols);

    return results;
  }

  async checkHealth(): Promise<{ status: string; binanceConnected: boolean }> {
    const binanceConnected = await binanceClient.checkConnection();

    return {
      status: binanceConnected ? 'healthy' : 'degraded',
      binanceConnected,
    };
  }
}

export const priceService = new PriceService();
