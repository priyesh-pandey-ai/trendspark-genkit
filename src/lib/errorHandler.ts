/**
 * Error handling utilities for API rate limits and other errors
 */

export interface APIError {
  status?: number;
  message: string;
  isRateLimit: boolean;
  isNetworkError: boolean;
  retryAfter?: number;
  originalError?: any;
}

/**
 * Detects if an error is a rate limit error (429)
 */
export function isRateLimitError(error: any): boolean {
  // Check HTTP status code
  if (error?.status === 429) {
    return true;
  }

  // Check error message for rate limit indicators
  const message = error?.message || error?.toString() || '';
  const rateLimitPatterns = [
    /rate.?limit/i,
    /quota/i,
    /too.?many.?requests/i,
    /throttled?/i,
    /429/,
  ];

  return rateLimitPatterns.some(pattern => pattern.test(message));
}

/**
 * Detects if an error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true;
  }

  const message = error?.message || '';
  return /network|connection|fetch|offline/i.test(message);
}

/**
 * Extracts retry-after time from response headers or error
 */
export function getRetryAfter(error: any): number | undefined {
  // Check error for explicit retry-after
  if (error?.retryAfter) {
    const retryAfter = parseInt(error.retryAfter, 10);
    return isNaN(retryAfter) ? 30 : retryAfter;
  }

  // Check response headers if available
  if (error?.context?.response?.headers) {
    const retryAfter = error.context.response.headers.get('retry-after');
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      return isNaN(seconds) ? 30 : seconds;
    }
  }

  // Default to 30 seconds for rate limits
  return undefined;
}

/**
 * Normalizes various error types into a consistent APIError format
 */
export function normalizeError(error: any): APIError {
  const isRateLimit = isRateLimitError(error);
  const isNetwork = isNetworkError(error);

  let message = 'An unexpected error occurred';
  let status: number | undefined;

  if (error?.message) {
    message = error.message;
  } else if (error?.toString) {
    const errorStr = error.toString();
    if (errorStr && errorStr !== '[object Object]') {
      message = errorStr;
    }
  }

  if (error?.status) {
    status = error.status;
  } else if (error?.context?.response?.status) {
    status = error.context.response.status;
  }

  // Provide friendly messages for common scenarios
  if (isRateLimit) {
    message = 'API rate limit exceeded. Please wait a moment and try again.';
  } else if (isNetwork) {
    message = 'Network connection error. Please check your internet connection.';
  } else if (status === 401 || status === 403) {
    message = 'Authentication error. Please log in again.';
  } else if (status === 404) {
    message = 'Resource not found.';
  } else if (status === 500 || status === 502 || status === 503) {
    message = 'Server error. Please try again later.';
  }

  return {
    status,
    message,
    isRateLimit,
    isNetworkError: isNetwork,
    retryAfter: isRateLimit ? getRetryAfter(error) : undefined,
    originalError: error,
  };
}

/**
 * Formats error for display in UI
 */
export function formatErrorDisplay(error: APIError): {
  title: string;
  description: string;
  details?: string;
} {
  let title = 'Error';
  let description = error.message;

  if (error.isRateLimit) {
    title = 'Rate Limit Exceeded';
    description = error.message;
  } else if (error.isNetworkError) {
    title = 'Network Error';
    description = 'Unable to connect to the server. Please check your internet connection.';
  } else if (error.status === 401 || error.status === 403) {
    title = 'Authentication Error';
    description = 'Your session has expired. Please log in again.';
  } else if (error.status === 404) {
    title = 'Not Found';
    description = 'The requested resource could not be found.';
  } else if (error.status && error.status >= 500) {
    title = 'Server Error';
    description = 'The server encountered an error. Please try again later.';
  }

  return {
    title,
    description,
    details: error.originalError ? JSON.stringify(error.originalError, null, 2) : undefined,
  };
}

/**
 * Sleep function for retry delays
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
