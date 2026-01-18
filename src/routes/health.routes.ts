import type { FastifyInstance } from 'fastify';
import { priceService } from '../services/price.service.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_request, reply) => {
    const health = await priceService.checkHealth();

    return reply.code(200).send({
      ...health,
      timestamp: Date.now(),
    });
  });
}
