/**
 * Sync Manager
 * Delta sync with conflict resolution
 * Ported from V1 — updated for V2 21-table schema
 * Uses __crsql_version as vector clock instead of syncVersion
 */

import { query, run, queryOne } from './db';
import { getTabletId } from './networkCoordinator';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SyncHandshake {
  type: 'handshake';
  tabletId: string;
  timestamp: number;
}

interface SyncData {
  type: 'sync_data';
  fromTabletId: string;
  toTabletId: string;
  tables: Record<string, any[]>;
  timestamp: number;
  isReply?: boolean;
}

interface SyncComplete {
  type: 'sync_complete';
  tabletId: string;
  recordsProcessed: number;
  timestamp: number;
}

type SyncMessage = SyncHandshake | SyncData | SyncComplete;

// ─── Tables to sync in dependency order ──────────────────────────────────────
// Order matters — parent tables must be synced before child tables
// because of foreign key constraints

const SYNC_TABLES_ORDERED = [
  // Lookup tables first (no dependencies)
  'communities',
  'condition_types',
  'medication_categories',
  'medication_types',
  'inventory_categories',
  // Core
  'patients',
  'visits',
  'visit_services',
  // Medical (depend on visits)
  'admissions_assessments',
  'medical_intakes',
  'visit_vitals',
  'visit_conditions',
  'visit_medications',
  'medications_dispensed',
  // Dental (depend on visits)
  'dental_intakes',
  'dental_procedures',
  'dental_antibiotics',
  // Inventory
  'inventory_items',
  'inventory_transactions',
  // collision_remaps removed — no __crsql_version column
];

const SYNC_MAX_RECORDS_PER_TABLE = 500;

// ─── State ────────────────────────────────────────────────────────────────────

let isSyncing = false;
let lastSyncWatermarks: Map<string, number> = new Map();
let onSyncStatusChange: ((syncing: boolean, progress: string) => void) | null = null;
let onSyncComplete: (() => void) | null = null;
// ─── Public API ───────────────────────────────────────────────────────────────

export function setSyncStatusCallback(
  callback: (syncing: boolean, progress: string) => void
): void {
  onSyncStatusChange = callback;
}
export function setSyncCompleteCallback(callback: () => void): void {
  onSyncComplete = callback;
}
export function getSyncStatus(): { isSyncing: boolean } {
  return { isSyncing };
}

export function resetSyncState(): void {
  isSyncing = false;
  updateStatus(false, '');
}
export function resetWatermarks(): void {
  lastSyncWatermarks = new Map();
}

// ─── Handshake ────────────────────────────────────────────────────────────────

export function sendHandshake(sendFn: (msg: string) => void): void {
  lastSyncWatermarks = new Map();
  const handshake: SyncHandshake = {
    type: 'handshake',
    tabletId: getTabletId(),
    timestamp: Date.now(),
  };
  sendFn(JSON.stringify(handshake) + '\n---END---\n');
  console.log('[SYNC] Handshake sent');
}
// ─── Message Router ───────────────────────────────────────────────────────────

export async function handleSyncMessage(
  messageStr: string,
  sendFn: (msg: string) => void
): Promise<void> {
  try {
    const message: SyncMessage = JSON.parse(messageStr);

    switch (message.type) {
      case 'handshake':
        if (isSyncing) {
          console.log('[SYNC] Skipping handshake — sync in progress');
          return;
        }
        await handleHandshake(message, sendFn);
        break;

      case 'sync_data':
        if (isSyncing) {
          console.log('[SYNC] Skipping sync_data — sync in progress');
          return;
        }
        await handleSyncData(message, sendFn);
        break;

      case 'sync_complete':
        handleSyncComplete(message);
        break;

      default:
        console.warn('[SYNC] Unknown message type');
    }
  } catch (error) {
    console.error('[SYNC] Failed to handle message:', error);
    isSyncing = false;
  }
}

// ─── Handshake Handler ────────────────────────────────────────────────────────

async function handleHandshake(
  handshake: SyncHandshake,
  sendFn: (msg: string) => void
): Promise<void> {
  console.log('[SYNC] Received handshake from:', handshake.tabletId);
  updateStatus(true, `Connected to ${handshake.tabletId}`);

  // Reset watermarks so all records are included in every sync
  lastSyncWatermarks = new Map();

  const deltaData = await fetchDeltaChanges();

  const syncData: SyncData = {
    type: 'sync_data',
    fromTabletId: getTabletId(),
    toTabletId: handshake.tabletId,
    tables: deltaData,
    timestamp: Date.now(),
  };

  sendFn(JSON.stringify(syncData) + '\n---END---\n');

  const totalRecords = Object.values(deltaData).reduce((sum, rows) => sum + rows.length, 0);
  console.log(`[SYNC] Sent ${totalRecords} records across ${Object.keys(deltaData).length} tables`);
  updateStatus(true, `Sent ${totalRecords} records`);
}

// ─── Delta Fetch ──────────────────────────────────────────────────────────────

async function fetchDeltaChanges(
  watermarkOverride?: number
): Promise<Record<string, any[]>> {
  const result: Record<string, any[]> = {};

  for (const table of SYNC_TABLES_ORDERED) {
    try {
      const watermark = watermarkOverride ?? (lastSyncWatermarks.get(table) || 0);

      const rows = query<any>(
        `SELECT * FROM ${table} WHERE __crsql_version > ? ORDER BY __crsql_version ASC LIMIT ?`,
        [watermark, SYNC_MAX_RECORDS_PER_TABLE]
      );

      if (rows.length > 0) {
        result[table] = rows;
        console.log(`[SYNC] Delta: ${table} — ${rows.length} rows`);
      }
    } catch (error) {
      // Table may not have __crsql_version — skip it
      console.warn(`[SYNC] Skipping ${table}:`, error);
    }
  }

  return result;
}

// ─── Sync Data Handler ────────────────────────────────────────────────────────

async function handleSyncData(
  syncData: SyncData,
  sendFn: (msg: string) => void
): Promise<void> {
  console.log('[SYNC] Received sync data from:', syncData.fromTabletId);

  const totalRecords = Object.values(syncData.tables).reduce(
    (sum, rows) => sum + rows.length, 0
  );

  updateStatus(true, `Receiving ${totalRecords} records...`);

  let processed = 0;
  let inserted = 0;
  let skipped = 0;

  // Process tables in dependency order
  for (const table of SYNC_TABLES_ORDERED) {
    const rows = syncData.tables[table];
    if (!rows || rows.length === 0) continue;

    for (const row of rows) {
      try {
        const existed = upsertRow(table, row);
        processed++;
        if (existed) skipped++;
        else inserted++;
      } catch (error) {
        console.error(`[SYNC] Failed to upsert row in ${table}:`, error);
      }
    }
  }

  // Update watermarks
  for (const [table, rows] of Object.entries(syncData.tables)) {
    if (rows.length > 0) {
      const maxVersion = Math.max(...rows.map((r: any) => r.__crsql_version || 0));
      const current = lastSyncWatermarks.get(table) || 0;
      if (maxVersion > current) {
        lastSyncWatermarks.set(table, maxVersion);
      }
    }
  }

  // Send completion
  const completion: SyncComplete = {
    type: 'sync_complete',
    tabletId: getTabletId(),
    recordsProcessed: processed,
    timestamp: Date.now(),
  };
  sendFn(JSON.stringify(completion) + '\n---END---\n');

  console.log(`[SYNC] Complete: +${inserted} inserted, ${skipped} skipped`);

  // Bidirectional — send our data back if this wasn't already a reply
  if (!syncData.isReply) {
    console.log('[SYNC] Sending reply to:', syncData.fromTabletId);
    const replyDelta = await fetchDeltaChanges(0);
    
    const reply: SyncData = {
      type: 'sync_data',
      fromTabletId: getTabletId(),
      toTabletId: syncData.fromTabletId,
      tables: replyDelta,
      timestamp: Date.now(),
      isReply: true,
    };

    sendFn(JSON.stringify(reply) + '\n---END---\n');
  }

  updateStatus(false, `Synced: +${inserted} new`);

  setTimeout(() => {
    if (!isSyncing) updateStatus(false, '');
  }, 5000);
}

// ─── Upsert ───────────────────────────────────────────────────────────────────

function upsertRow(table: string, row: any): boolean {
  // Get primary key for this table
  const pk = getPrimaryKey(table);
  if (!pk) return false;

  const pkValue = row[pk];
  if (!pkValue) return false;

  // Check if row exists
  const existing = queryOne<any>(
    `SELECT ${pk}, __crsql_version FROM ${table} WHERE ${pk} = ?`,
    [pkValue]
  );

  if (!existing) {
    // Insert new row
    const columns = Object.keys(row).join(', ');
    const placeholders = Object.keys(row).map(() => '?').join(', ');
    const values = Object.values(row);

    run(
      `INSERT OR IGNORE INTO ${table} (${columns}) VALUES (${placeholders})`,
      values
    );
    return false;
  }

  // Update if incoming version is higher
  const incomingVersion = row.__crsql_version || 0;
  const existingVersion = existing.__crsql_version || 0;

  if (incomingVersion > existingVersion) {
    const updates = Object.keys(row)
      .filter(k => k !== pk)
      .map(k => `${k} = ?`)
      .join(', ');
    const values = [
      ...Object.keys(row).filter(k => k !== pk).map(k => row[k]),
      pkValue,
    ];

    run(`UPDATE ${table} SET ${updates} WHERE ${pk} = ?`, values);
    return false;
  }

  return true; // skipped — our version is newer or equal
}

// ─── Primary Key Map ──────────────────────────────────────────────────────────

function getPrimaryKey(table: string): string | null {
  const pkMap: Record<string, string> = {
    communities: 'communityId',
    condition_types: 'conditionTypeId',
    medication_categories: 'medicationCategoryId',
    medication_types: 'medicationTypeId',
    inventory_categories: 'inventoryCategoryId',
    patients: 'patientId',
    visits: 'visitId',
    visit_services: 'visitServiceId',
    admissions_assessments: 'assessmentId',
    medical_intakes: 'intakeId',
    visit_vitals: 'vitalId',
    visit_conditions: 'visitConditionId',
    visit_medications: 'visitMedicationId',
    medications_dispensed: 'dispensedId',
    dental_intakes: 'dentalIntakeId',
    dental_procedures: 'dentalProcedureId',
    dental_antibiotics: 'dentalAntibioticId',
    inventory_items: 'itemId',
    inventory_transactions: 'transactionId',
  };

  return pkMap[table] || null;
}

// ─── Sync Complete Handler ────────────────────────────────────────────────────

function handleSyncComplete(completion: SyncComplete): void {
  console.log('[SYNC] Complete acknowledged from:', completion.tabletId);
  updateStatus(false, `Sync complete with ${completion.tabletId}`);

  setTimeout(() => {
    if (!isSyncing) updateStatus(false, '');
  }, 5000);
}

// ─── Status ───────────────────────────────────────────────────────────────────

function updateStatus(syncing: boolean, progress: string): void {
  isSyncing = syncing;
  if (onSyncStatusChange) {
    onSyncStatusChange(syncing, progress);
  }
  if (!syncing && onSyncComplete) {
    onSyncComplete();
  }
}
