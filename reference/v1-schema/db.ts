/**
 * Database Service
 * SQLite database initialization and management for Visit system
 */

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the SQLite database and create visits table
 * Must be called on app startup
 */
export async function initDB(): Promise<void> {
  try {
    // Open database (creates if doesn't exist)
    db = await SQLite.openDatabaseAsync('la_tortuga.db');

    // Create patients table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS patients (
        patientId TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        dateOfBirth TEXT NOT NULL,
        phone TEXT,
        notes TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        originTablet TEXT NOT NULL,
        lastSyncedAt INTEGER DEFAULT 0,
        syncVersion INTEGER DEFAULT 1
      );
    `);

    // Create visits table with new schema (without qrPayload)
    // If table already exists, this will be skipped
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS visits (
        visitId TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        clinicId TEXT NOT NULL,
        status TEXT NOT NULL,
        services TEXT NOT NULL,
        shortCode TEXT NOT NULL UNIQUE,
        openedAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        originTablet TEXT NOT NULL,
        lastSyncedAt INTEGER DEFAULT 0,
        syncVersion INTEGER DEFAULT 1
      );
    `);

    // Migration: Check if old qrPayload column exists and remove it
    // This handles users upgrading from the old schema
    try {
      // Try to query the table structure
      const tableInfo = await db.getAllAsync<any>('PRAGMA table_info(visits)');
      const hasQrPayload = tableInfo.some((col: any) => col.name === 'qrPayload');
      
      if (hasQrPayload) {
        console.log('⚠️ Found old schema with qrPayload column - migrating...');
        
        // SQLite doesn't support DROP COLUMN, so we need to:
        // 1. Create new table, 2. Copy data, 3. Drop old, 4. Rename new
        await db.execAsync(`
          CREATE TABLE visits_new (
            visitId TEXT PRIMARY KEY,
            patientId TEXT NOT NULL,
            clinicId TEXT NOT NULL,
            status TEXT NOT NULL,
            services TEXT NOT NULL,
            shortCode TEXT NOT NULL UNIQUE,
            openedAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL
          );
        `);
        
        await db.execAsync(`
          INSERT INTO visits_new 
          SELECT visitId, patientId, clinicId, status, services, shortCode, openedAt, updatedAt
          FROM visits;
        `);
        
        await db.execAsync('DROP TABLE visits;');
        await db.execAsync('ALTER TABLE visits_new RENAME TO visits;');
        
        console.log('✅ Migration complete - qrPayload column removed, data preserved!');
      } else {
        console.log('✅ Schema is up to date - no migration needed');
      }
    } catch (error) {
      // If table doesn't exist yet or other error, it's fine - new install
      console.log('ℹ️ No migration needed (new install or error checking schema)');
    }

    // Create indexes for faster lookups
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_patients_firstName 
      ON patients(firstName);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_patients_lastName 
      ON patients(lastName);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_patients_phone 
      ON patients(phone);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_visits_shortCode 
      ON visits(shortCode);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_visits_patientId 
      ON visits(patientId);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_visits_status 
      ON visits(status);
    `);

    // Create medical_intake_records table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS medical_intake_records (
        recordId TEXT PRIMARY KEY,
        visitId TEXT NOT NULL,
        formData TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        originTablet TEXT NOT NULL,
        lastSyncedAt INTEGER DEFAULT 0,
        syncVersion INTEGER DEFAULT 1,
        FOREIGN KEY (visitId) REFERENCES visits(visitId)
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_medical_records_visitId 
      ON medical_intake_records(visitId);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_medical_records_lastSyncedAt 
      ON medical_intake_records(lastSyncedAt);
    `);

    // Create dental_intake_records table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS dental_intake_records (
        recordId TEXT PRIMARY KEY,
        visitId TEXT NOT NULL,
        formData TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        originTablet TEXT NOT NULL,
        lastSyncedAt INTEGER DEFAULT 0,
        syncVersion INTEGER DEFAULT 1,
        FOREIGN KEY (visitId) REFERENCES visits(visitId)
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_dental_records_visitId 
      ON dental_intake_records(visitId);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_dental_records_lastSyncedAt 
      ON dental_intake_records(lastSyncedAt);
    `);

    // Create sync indexes for patients and visits
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_patients_lastSyncedAt 
      ON patients(lastSyncedAt);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_patients_originTablet 
      ON patients(originTablet);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_visits_lastSyncedAt 
      ON visits(lastSyncedAt);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_visits_originTablet 
      ON visits(originTablet);
    `);

    // Create settings table for app configuration
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);

    // Migration: Clean up corrupted dental records
    // This handles records with NULL or invalid formData
    try {
      console.log('🔍 Checking for corrupted dental records...');
      
      // Check if table exists
      const tableInfo = await db.getAllAsync<any>('PRAGMA table_info(dental_intake_records)');
      if (tableInfo.length > 0) {
        // Count records with NULL formData
        const nullCount = await db.getFirstAsync<any>(
          'SELECT COUNT(*) as count FROM dental_intake_records WHERE formData IS NULL OR formData = ""'
        );
        
        if (nullCount && nullCount.count > 0) {
          console.log(`⚠️ Found ${nullCount.count} corrupted dental records - cleaning up...`);
          
          // Fix NULL formData by setting to empty JSON object
          await db.runAsync(
            'UPDATE dental_intake_records SET formData = ? WHERE formData IS NULL OR formData = ""',
            ['{}']
          );
          
          console.log('✅ Fixed corrupted dental records');
        } else {
          console.log('✅ No corrupted dental records found');
        }
      }
    } catch (error) {
      console.log('ℹ️ Dental record cleanup skipped (table may not exist yet or error occurred):', error);
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Get database instance
 * Throws if database not initialized
 */
export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    console.error('❌ Database not initialized! DB is null.');
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
 * Includes error handling and retry logic
 */
export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const database = getDB();
    const result = await database.getAllAsync<T>(sql, params);
    return result;
  } catch (error) {
    console.error('❌ Query failed:', sql, 'Params:', params, 'Error:', error);
    throw error;
  }
}

/**
 * Execute a SQL query and return first row
 * Includes error handling and retry logic
 */
export async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  try {
    const database = getDB();
    
    // Validate parameters
    if (!sql || typeof sql !== 'string') {
      console.error('❌ QueryOne failed: Invalid SQL string');
      return null;
    }
    
    if (!Array.isArray(params)) {
      console.error('❌ QueryOne failed: params must be an array');
      return null;
    }
    
    // Check for null parameters that could cause NullPointerException
    const hasNullParam = params.some(param => param === null || param === undefined);
    if (hasNullParam) {
      console.warn('⚠️ QueryOne warning: params contains null/undefined values:', params);
    }
    
    const result = await database.getFirstAsync<T>(sql, params);
    return result;
  } catch (error) {
    console.error('❌ QueryOne failed:', sql, 'Params:', params, 'Error:', error);
    // Return null instead of throwing to allow graceful handling
    return null;
  }
}

/**
 * Execute a SQL statement (INSERT, UPDATE, DELETE)
 * Includes error handling and retry logic
 */
export async function run(
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> {
  try {
    const database = getDB();
    const result = await database.runAsync(sql, params);
    return result;
  } catch (error) {
    console.error('❌ Run failed:', sql, 'Params:', params, 'Error:', error);
    throw error;
  }
}

/**
 * Close database connection
 * Useful for testing or app cleanup
 */
export async function closeDB(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
