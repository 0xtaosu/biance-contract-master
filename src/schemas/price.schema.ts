import { z } from 'zod';
import { env } from '../config/env.js';

// Request schemas
export const symbolParamSchema = z.object({
  symbol: z
    .string()
    .min(2, 'Symbol must be at least 2 characters')
    .max(20, 'Symbol must be at most 20 characters')
    .regex(/^[A-Z0-9]+$/i, 'Symbol must contain only letters and numbers')
    .transform((val) => val.toUpperCase()),
});

export const batchPriceRequestSchema = z.object({
  symbols: z
    .array(
      z
        .string()
        .min(2, 'Symbol must be at least 2 characters')
        .max(20, 'Symbol must be at most 20 characters')
        .regex(/^[A-Z0-9]+$/i, 'Symbol must contain only letters and numbers')
    )
    .min(1, 'At least one symbol is required')
    .max(env.MAX_BATCH_SYMBOLS, `Cannot request more than ${env.MAX_BATCH_SYMBOLS} symbols`)
    .transform((symbols) => symbols.map((s) => s.toUpperCase()))
    .refine((symbols) => new Set(symbols).size === symbols.length, {
      message: 'Duplicate symbols are not allowed',
    }),
});

// Response schemas
export const contractPriceSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  timestamp: z.number(),
});

export const batchPriceResultSchema = z.object({
  symbol: z.string(),
  price: z.number().optional(),
  timestamp: z.number().optional(),
  error: z.string().optional(),
});

export const batchPriceResponseSchema = z.object({
  results: z.array(batchPriceResultSchema),
  total: z.number(),
  successful: z.number(),
  failed: z.number(),
});

export const healthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded']),
  binanceConnected: z.boolean(),
  timestamp: z.number(),
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});

// Type exports
export type SymbolParam = z.infer<typeof symbolParamSchema>;
export type BatchPriceRequest = z.infer<typeof batchPriceRequestSchema>;
export type ContractPriceResponse = z.infer<typeof contractPriceSchema>;
export type BatchPriceResult = z.infer<typeof batchPriceResultSchema>;
export type BatchPriceResponse = z.infer<typeof batchPriceResponseSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
