/**
 * Utility to retry an async function with configurable delay and exponential backoff.
 *
 * @template T
 * @param fn The async function to execute.
 * @param options Retry options.
 * @param options.num_retry Number of retries (default: 1)
 * @param options.initial_delay Initial delay in ms before retry (default: 2000)
 * @param options.exponential_backoff If true, delay doubles after each retry (default: false)
 * @returns The result of the async function, or throws the last error if all retries fail.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    num_retry?: number;
    initial_delay?: number;
    exponential_backoff?: boolean;
  }
): Promise<T> {
  const num_retry = options?.num_retry ?? 1;
  const initial_delay = options?.initial_delay ?? 2000;
  const exponential_backoff = options?.exponential_backoff ?? false;

  let attempt = 0;
  let delay = initial_delay;
  let lastError: any = null;

  while (attempt <= num_retry) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === num_retry) break;
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (exponential_backoff) delay *= 2;
      attempt++;
    }
  }
  throw lastError;
} 