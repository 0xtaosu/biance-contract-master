import { USDMClient } from '@binance/connector-typescript';
import { binanceConfig } from '../config/binance.config.js';
import { logger } from '../utils/logger.js';
import { BinanceAPIError, ServiceUnavailableError } from '../utils/errors.js';
import type { ContractPrice, BatchPriceResult, BinancePriceResponse } from './types.js';

export class BinanceClient {
  private client: USDMClient;

  constructor() {
    this.client = new USDMClient({
      apiKey: binanceConfig.apiKey,
      apiSecret: binanceConfig.apiSecret,
      baseURL: binanceConfig.baseURL,
      timeout: binanceConfig.timeout,
    });

    logger.info('BinanceClient initialized', {
      baseURL: binanceConfig.baseURL,
      isTestnet: binanceConfig.isTestnet,
    });
  }

  async getContractPrice(symbol: string): Promise<ContractPrice> {
    try {
      logger.debug('Fetching price for symbol', { symbol });

      const response = await this.client.tickerPrice({ symbol });

      if (!response || typeof response !== 'object') {
        throw new BinanceAPIError('Invalid response from Binance API');
      }

      const data = response as BinancePriceResponse;

      if (!data.price) {
        throw new BinanceAPIError(`No price data returned for symbol: ${symbol}`);
      }

      const price: ContractPrice = {
        symbol: data.symbol,
        price: parseFloat(data.price),
        timestamp: data.time || Date.now(),
      };

      logger.debug('Price fetched successfully', { symbol, price: price.price });

      return price;
    } catch (error) {
      logger.error('Error fetching contract price', {
        symbol,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof BinanceAPIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new ServiceUnavailableError('Request to Binance API timed out', {
            symbol,
            originalError: error.message,
          });
        }

        if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
          throw new ServiceUnavailableError('Unable to connect to Binance API', {
            symbol,
            originalError: error.message,
          });
        }
      }

      throw new BinanceAPIError(`Failed to fetch price for ${symbol}`, {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getMultipleContractPrices(symbols: string[]): Promise<BatchPriceResult[]> {
    logger.debug('Fetching prices for multiple symbols', { count: symbols.length });

    const results = await Promise.allSettled(
      symbols.map((symbol) => this.getContractPrice(symbol))
    );

    const batchResults: BatchPriceResult[] = results.map((result, index) => {
      const symbol = symbols[index];

      if (result.status === 'fulfilled') {
        return {
          symbol: result.value.symbol,
          price: result.value.price,
          timestamp: result.value.timestamp,
        };
      } else {
        const error = result.reason;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        logger.warn('Failed to fetch price for symbol', {
          symbol,
          error: errorMessage,
        });

        return {
          symbol,
          error: errorMessage,
        };
      }
    });

    logger.debug('Batch price fetch completed', {
      total: symbols.length,
      successful: batchResults.filter((r) => !r.error).length,
      failed: batchResults.filter((r) => r.error).length,
    });

    return batchResults;
  }

  async checkConnection(): Promise<boolean> {
    try {
      logger.debug('Checking Binance API connection');
      await this.client.ping();
      logger.info('Binance API connection successful');
      return true;
    } catch (error) {
      logger.error('Binance API connection check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}

export const binanceClient = new BinanceClient();
