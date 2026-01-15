import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from '../config';

// Create postgres connection
const connection = postgres(config.database.url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});

// Create drizzle instance with schema
export const db = drizzle(connection, { schema });

// Export types
export type Database = typeof db;
