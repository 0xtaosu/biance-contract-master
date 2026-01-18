import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health.routes.js';
import { priceRoutes } from './routes/price.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: false, // Using custom Winston logger instead
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: '1 minute',
  });

  // Request logging
  fastify.addHook('onRequest', async (request) => {
    logger.info('Incoming request', {
      method: request.method,
      url: request.url,
      ip: request.ip,
    });
  });

  fastify.addHook('onResponse', async (request, reply) => {
    logger.info('Response sent', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    });
  });

  // Register error handler
  fastify.setErrorHandler(errorHandler);

  // Register routes
  await fastify.register(healthRoutes, { prefix: '/api/v1' });
  await fastify.register(priceRoutes, { prefix: '/api/v1' });

  // Root endpoint
  fastify.get('/', async () => {
    return {
      name: 'Binance Contract API',
      version: '1.0.0',
      endpoints: {
        health: '/api/v1/health',
        singlePrice: '/api/v1/prices/:symbol',
        batchPrice: '/api/v1/prices/batch',
      },
    };
  });

  return fastify;
}
