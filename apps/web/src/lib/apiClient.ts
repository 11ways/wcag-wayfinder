/**
 * Enhanced API client with timeout, retry, and error handling
 * This module provides a robust fetch wrapper for API calls
 */

import type { ApiError } from './types';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly originalError?: Error;

  constructor(message: string, statusCode: number, originalError?: Error) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Creates an AbortController that times out after the specified duration
 */
function createTimeoutController(timeout: number): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    // Retry on server errors (5xx) and network errors
    return error.statusCode >= 500 || error.statusCode === 0;
  }
  if (error instanceof Error) {
    // Retry on network errors (e.g., AbortError from timeout)
    return error.name === 'AbortError' || error.message.includes('network');
  }
  return false;
}

/**
 * Enhanced fetch with timeout and retry support
 */
export async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const { controller, timeoutId } = createTimeoutController(timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Parse error response
        const errorBody = await response.json().catch(() => ({
          error: 'Unknown error',
          message: `HTTP ${response.status}`,
        })) as ApiError;

        throw new ApiClientError(
          errorBody.message || errorBody.error || `HTTP ${response.status}`,
          response.status
        );
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Convert AbortError to ApiClientError
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new ApiClientError('Request timed out', 408, error);
      } else if (error instanceof ApiClientError) {
        lastError = error;
      } else if (error instanceof Error) {
        lastError = new ApiClientError(error.message, 0, error);
      } else {
        lastError = new ApiClientError('Unknown error occurred', 0);
      }

      // Check if we should retry
      if (attempt < retries && isRetryableError(lastError)) {
        // Exponential backoff: delay * 2^attempt
        const backoffDelay = retryDelay * Math.pow(2, attempt);
        await sleep(backoffDelay);
        continue;
      }

      throw lastError;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new ApiClientError('Max retries exceeded', 0);
}

/**
 * Convenience method for GET requests
 */
export async function get<T>(url: string, options?: FetchOptions): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * Convenience method for POST requests
 */
export async function post<T>(
  url: string,
  body: unknown,
  options?: FetchOptions
): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Convenience method for PUT requests
 */
export async function put<T>(
  url: string,
  body: unknown,
  options?: FetchOptions
): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Convenience method for DELETE requests
 */
export async function del<T>(url: string, options?: FetchOptions): Promise<T> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'DELETE',
  });
}

// Export all utilities
export const apiClient = {
  get,
  post,
  put,
  delete: del,
  fetchWithRetry,
};
