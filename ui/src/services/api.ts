import type {
  ContractPrice,
  BatchPriceRequest,
  BatchPriceResponse,
  HealthResponse,
  ErrorResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new ApiError(
      errorData.error.message,
      errorData.error.code,
      response.status,
      errorData.error.details
    );
  }
  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<HealthResponse>(response);
}

export async function getSinglePrice(symbol: string): Promise<ContractPrice> {
  const response = await fetch(`${API_BASE_URL}/prices/${symbol}`);
  return handleResponse<ContractPrice>(response);
}

export async function getBatchPrices(request: BatchPriceRequest): Promise<BatchPriceResponse> {
  const response = await fetch(`${API_BASE_URL}/prices/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<BatchPriceResponse>(response);
}

export { ApiError };
