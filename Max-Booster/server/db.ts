import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from './config/defaults.js';

neonConfig.webSocketConstructor = ws;

if (!config.database.url) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool for optimal performance and scalability
export const pool = new Pool({ 
  connectionString: config.database.url,
  max: config.database.poolSize,
  idleTimeoutMillis: config.database.idleTimeout,
  connectionTimeoutMillis: config.database.connectionTimeout,
});

export const db = drizzle({ client: pool, schema });