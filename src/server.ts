import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    logger.info(`Server started successfully`, {
      port: env.PORT,
      environment: env.NODE_ENV,
      url: `http://localhost:${env.PORT}`,
    });

    logger.info('Available endpoints:', {
      health: `http://localhost:${env.PORT}/api/v1/health`,
      singlePrice: `http://localhost:${env.PORT}/api/v1/prices/:symbol`,
      batchPrice: `http://localhost:${env.PORT}/api/v1/prices/batch`,
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const;

signals.forEach((signal) => {
  process.on(signal, () => {
    logger.info(`Received ${signal}, shutting down gracefully`);

    try {
      // Perform cleanup here
      logger.info('Cleanup completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      process.exit(1);
    }
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  process.exit(1);
});

start().catch((error) => {
  logger.error('Fatal error during startup', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exit(1);
});
