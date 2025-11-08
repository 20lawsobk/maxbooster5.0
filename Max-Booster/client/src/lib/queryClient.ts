import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { errorService, captureException } from "./errorService";

// Default timeout for API calls (30 seconds)
const DEFAULT_TIMEOUT_MS = 30000;

// Create an AbortController with timeout
function createAbortControllerWithTimeout(timeoutMs: number = DEFAULT_TIMEOUT_MS): AbortController {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request timeout after ${timeoutMs}ms`));
  }, timeoutMs);
  
  // Clear timeout if request completes
  const originalAbort = controller.abort.bind(controller);
  controller.abort = function(reason?: any) {
    clearTimeout(timeoutId);
    originalAbort(reason);
  };
  
  return controller;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const error = new Error(`${res.status}: ${text}`);
    
    // Capture error to our error service
    captureException(error, {
      action: 'api-response-error',
      metadata: {
        status: res.status,
        url: res.url,
        statusText: res.statusText,
      },
    });
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    timeout?: number;
    signal?: AbortSignal;
    retryCount?: number;
    maxRetries?: number;
  }
): Promise<Response> {
  const isFormData = data instanceof FormData;
  const controller = options?.signal ? null : createAbortControllerWithTimeout(options?.timeout);
  const signal = options?.signal || controller?.signal;
  
  try {
    // Add breadcrumb for debugging
    errorService.addBreadcrumb('api-request', {
      method,
      url,
      hasData: !!data,
    });
    
    const res = await fetch(url, {
      method,
      headers: isFormData ? {} : (data ? { "Content-Type": "application/json" } : {}),
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      credentials: "include",
      signal,
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    // Handle timeout errors
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      const timeoutError = new Error(`Request to ${url} timed out`);
      captureException(timeoutError, {
        action: 'api-timeout',
        metadata: { method, url },
      });
      throw timeoutError;
    }
    
    // Handle network errors with retry logic
    if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
      const retryCount = options?.retryCount || 0;
      const maxRetries = options?.maxRetries || 3;
      
      if (retryCount < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return apiRequest(method, url, data, {
          ...options,
          retryCount: retryCount + 1,
        });
      }
    }
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const controller = signal ? null : createAbortControllerWithTimeout();
    const abortSignal = signal || controller?.signal;
    
    try {
      errorService.addBreadcrumb('query-fetch', {
        queryKey: queryKey.join('/'),
      });
      
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
        signal: abortSignal,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error: any) {
      // Handle timeout errors
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        const timeoutError = new Error(`Query ${queryKey.join('/')} timed out`);
        captureException(timeoutError, {
          action: 'query-timeout',
          metadata: { queryKey: queryKey.join('/') },
        });
        throw timeoutError;
      }
      
      // Capture other errors
      captureException(error, {
        action: 'query-error',
        metadata: { queryKey: queryKey.join('/') },
      });
      
      throw error;
    }
  };

// Enhanced retry logic with exponential backoff
function retryDelayWithJitter(attemptIndex: number): number {
  const baseDelay = Math.min(1000 * Math.pow(2, attemptIndex), 30000);
  const jitter = Math.random() * 1000; // Add up to 1 second of jitter
  return baseDelay + jitter;
}

// Determine if error is retryable
function shouldRetry(error: any): boolean {
  // Don't retry on client errors (4xx) except for 401 and 403
  if (error.message?.includes('401') || error.message?.includes('403')) {
    return false;
  }
  if (error.message?.match(/4\d{2}/)) {
    return false;
  }
  
  // Retry on network errors, timeouts, and server errors
  return (
    error.message?.includes('NetworkError') ||
    error.message?.includes('fetch') ||
    error.message?.includes('timeout') ||
    error.message?.match(/5\d{2}/) ||
    error.name === 'NetworkError' ||
    error.name === 'TimeoutError'
  );
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      retry: (failureCount, error) => {
        // Max 3 retries
        if (failureCount >= 3) return false;
        // Only retry on retryable errors
        return shouldRetry(error);
      },
      retryDelay: retryDelayWithJitter,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Max 2 retries for mutations
        if (failureCount >= 2) return false;
        // Only retry on retryable errors
        return shouldRetry(error);
      },
      retryDelay: retryDelayWithJitter,
    },
  },
});