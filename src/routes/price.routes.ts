import type { FastifyInstance } from 'fastify';
import { priceService } from '../services/price.service.js';
import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';

export async function priceRoutes(fastify: FastifyInstance) {
  // GET /prices/:symbol - Get single symbol price
  fastify.get<{
    Params: { symbol: string };
  }>('/prices/:symbol', async (request, reply) => {
    const { symbol } = request.params;

    logger.info('GET /prices/:symbol request', { symbol });

    const price = await priceService.getPrice(symbol);

    return reply.code(200).send(price);
  });

  // POST /prices/batch - Get multiple symbol prices
  fastify.post<{
    Body: { symbols?: string[] };
  }>('/prices/batch', async (request, reply) => {
    const symbols = request.body?.symbols;

    if (!symbols) {
      logger.warn('POST /prices/batch request missing symbols field');
      throw new ValidationError('symbols field is required');
    }

    logger.info('POST /prices/batch request', { count: symbols.length });

    const results = await priceService.getBatchPrices(symbols);

    const successful = results.filter((r) => !r.error).length;
    const failed = results.filter((r) => r.error).length;

    return reply.code(200).send({
      results,
      total: results.length,
      successful,
      failed,
    });
  });
}
