/**
 * La Tortuga EMR — Database Service V2
 * SQLite database initialization and management
 * Uses @op-engineering/op-sqlite with cr-sqlite CRDT extension
 */

import { open, OPSQLiteConnection, QueryResult } from '@op-engineering/op-sqlite';

// ── Database instance ──────────────────────────────────────────
let db: OPSQLiteConnection | null = null;

/**
 * Get database instance
 * Throws if database not initialized
 */
export function getDB(): OPSQLiteConnection {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

/**
 * Check if database is initialized
 */
export function isDBInitialized(): boolean {
  return db !== null;
}

/**
 * Execute a SQL query and return all rows
 */
export function query<T = any>(
  sql: string,
  params: any[] = []
): T[] {
  try {
    const result = getDB().execute(sql, params);
    return (result.rows ?? []) as T[];
  } catch (error) {
    console.error('❌ Query failed:', sql, error);
    throw error;
  }
}

/**
 * Execute a SQL query and return first row or null
 */
export function queryOne<T = any>(
  sql: string,
  params: any[] = []
): T | null {
  try {
    const result = getDB().execute(sql, params);
    const rows = result.rows ?? [];
    return rows.length > 0 ? (rows[0] as T) : null;
  } catch (error) {
    console.error('❌ QueryOne failed:', sql, error);
    return null;
  }
}

/**
 * Execute a SQL statement (INSERT, UPDATE, DELETE)
 */
export function run(
  sql: string,
  params: any[] = []
): QueryResult {
  try {
    return getDB().execute(sql, params);
  } catch (error) {
    console.error('❌ Run failed:', sql, error);
    throw error;
  }
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
  }
}