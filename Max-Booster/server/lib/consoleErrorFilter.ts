// Global console.error filter to suppress Redis connection errors
// This MUST be imported first, before any Redis clients are created
// Works in all environments to prevent Redis connection errors from cluttering logs

const originalConsoleError = console.error;

console.error = (...args: unknown[]) => {
  // Get the first argument as an error object or string
  const firstArg = args[0];

  // Check various forms of Redis connection errors
  const isRedisError =
    // String message format
    (typeof firstArg === 'string' &&
      ((firstArg.includes('ECONNREFUSED') && firstArg.includes('6379')) ||
        (firstArg.includes('Connection is closed') && firstArg.includes('ioredis')) ||
        firstArg.includes('ENOTFOUND'))) ||
    // Error object format
    (firstArg instanceof Error &&
      ((firstArg.message?.includes('ECONNREFUSED') && firstArg.message?.includes('6379')) ||
        ((firstArg as any).code === 'ECONNREFUSED' && (firstArg as any).port === 6379) ||
        (firstArg as any).code === 'ENOTFOUND' ||
        (firstArg.message?.includes('Connection is closed') &&
          firstArg.stack?.includes('ioredis')) ||
        firstArg.message?.includes('MaxRetriesPerRequestError') ||
        (firstArg.stack?.includes('ioredis') && firstArg.message?.includes('connect'))));

  // Only log if it's not a Redis connection error
  if (!isRedisError) {
    originalConsoleError.apply(console, args);
  }
};

if (process.env.NODE_ENV === 'development') {
  console.log('✅ Redis error filter installed for development');
}
