import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  logger.error('Request error', {
    method: request.method,
    url: request.url,
    error: error.message,
    stack: error.stack,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          issues: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
      },
    });
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.code(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Request validation failed',
        details: {
          validation: error.validation,
        },
      },
    });
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    return reply.code(429).send({
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Too many requests, please try again later',
      },
    });
  }

  // Handle not found errors
  if (error.statusCode === 404) {
    return reply.code(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    });
  }

  // Handle all other errors as internal server errors
  const statusCode = error.statusCode || 500;

  return reply.code(statusCode).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details:
        process.env.NODE_ENV === 'development'
          ? {
              originalError: error.message,
              stack: error.stack,
            }
          : undefined,
    },
  });
}
