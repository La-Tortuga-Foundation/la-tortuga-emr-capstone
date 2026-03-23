/**
 * La Tortuga EMR — V2 Database Service
 *
 * Architecture: Hybrid — relational for reportable data, JSON for complex multi-select fields
 * Tables: 21
 * Sync: cr-sqlite (CRDT) alongside custom sync logic via @op-engineering/op-sqlite
 * Static lookups: TypeScript constants (not tables)
 *
 * Sections:
 *   Dynamic Lookups  — communities, condition_types, medication_categories,
 *                      medication_types, inventory_categories
 *   Core             — patients, visits, visit_services
 *   Medical          — admissions_assessments, medical_intakes, visit_vitals,
 *                      visit_conditions, visit_medications, medications_dispensed
 *   Dental           — dental_intakes, dental_procedures, dental_antibiotics
 *   Inventory        — inventory_items, inventory_transactions
 *   System           — settings, collision_remaps
 */

import { open, type DB } from '@op-engineering/op-sqlite';

// ─── Database Instance ────────────────────────────────────────────────────────

let db: DB | null = null;
let initialized = false;

export function getDB(): DB {
  if (!db) throw new Error('[DB] Database not initialized. Call initDB() first.');
  return db;
}

export function isDBInitialized(): boolean {
  return initialized;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function query<T>(sql: string, params: unknown[] = []): T[] {
  try {
    const result = getDB().executeSync(sql, params);
    return (result.rows ?? []) as T[];
  } catch (error) {
    console.error('[DB] Query failed:', sql, error);
    throw error;
  }
}

export function queryOne<T>(sql: string, params: unknown[] = []): T | null {
  try {
    const result = getDB().executeSync(sql, params);
    const rows = result.rows ?? [];
    return rows.length > 0 ? (rows[0] as T) : null;
  } catch (error) {
    console.error('[DB] QueryOne failed:', sql, error);
    return null;
  }
}

export function run(sql: string, params: unknown[] = []): void {
  try {
    getDB().executeSync(sql, params);
  } catch (error) {
    console.error('[DB] Run failed:', sql, error);
    throw error;
  }
}

export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
    initialized = false;
    console.log('[DB] Database closed.');
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initDB(): void {
  if (initialized) {
    console.log('[DB] Already initialized.');
    return;
  }

  initialized = true;

  db = open({ name: 'la_tortuga_v2.db' });

  run('PRAGMA journal_mode=WAL;');
  run('PRAGMA foreign_keys=ON;');

  createDynamicLookupTables();
  createCoreTables();
  createMedicalTables();
  createDentalTables();
  createInventoryTables();
  createSystemTables();
  createIndexes();
  seedDynamicLookups();

  try {
    enableCRDT();
  } catch (e) {
    console.warn('[DB] cr-sqlite not available.');
  }

  console.log('[DB] Initialized — 21 tables ready.');
}



// ─── Dynamic Lookup Tables ────────────────────────────────────────────────────

function createDynamicLookupTables(): void {
  run(`
    CREATE TABLE IF NOT EXISTS communities (
      communityId   TEXT PRIMARY KEY NOT NULL,
      name          TEXT NOT NULL,
      region        TEXT,
      __crsql_siteid TEXT,
      __crsql_version INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS condition_types (
      conditionTypeId TEXT PRIMARY KEY NOT NULL,
      label           TEXT NOT NULL,
      icd10Code       TEXT,
      __crsql_siteid  TEXT,
      __crsql_version INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS medication_categories (
      medicationCategoryId TEXT PRIMARY KEY NOT NULL,
      label                TEXT NOT NULL,
      __crsql_siteid       TEXT,
      __crsql_version      INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS medication_types (
      medicationTypeId     TEXT PRIMARY KEY NOT NULL,
      name                 TEXT NOT NULL,
      categoryId           TEXT REFERENCES medication_categories(medicationCategoryId),
      defaultUnit          TEXT,
      __crsql_siteid       TEXT,
      __crsql_version      INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS inventory_categories (
      inventoryCategoryId TEXT PRIMARY KEY NOT NULL,
      label               TEXT NOT NULL,
      __crsql_siteid      TEXT,
      __crsql_version     INTEGER DEFAULT 0
    );
  `);

  console.log('[DB] Dynamic lookup tables created.');
}

// ─── Core Tables ──────────────────────────────────────────────────────────────

function createCoreTables(): void {
  run(`
    CREATE TABLE IF NOT EXISTS patients (
      patientId     TEXT PRIMARY KEY NOT NULL,
      firstName     TEXT NOT NULL,
      lastName      TEXT NOT NULL,
      dateOfBirth   TEXT NOT NULL,
      genderTypeId  TEXT,
      communityId   TEXT REFERENCES communities(communityId),
      phone         TEXT,
      allergies     TEXT,
      familyHistory TEXT,
      familyGroupId TEXT,
      status        TEXT DEFAULT 'waiting',
      priority      INTEGER DEFAULT 0,
      arrivalOrder  INTEGER,
      notes         TEXT,
      __crsql_siteid  TEXT,
      __crsql_version INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS visits (
      visitId          TEXT PRIMARY KEY NOT NULL,
      patientId        TEXT NOT NULL REFERENCES patients(patientId),
      clinicId         TEXT,
      statusTypeId     TEXT,
      reasonForVisit   TEXT,
      reasonForVisitTag TEXT,
      shortCode        TEXT,
      checkedInAt      TEXT,
      closedAt         TEXT,
      __crsql_siteid   TEXT,
      __crsql_version  INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS visit_services (
      visitServiceId  TEXT PRIMARY KEY NOT NULL,
      visitId         TEXT NOT NULL REFERENCES visits(visitId),
      serviceTypeId   TEXT NOT NULL,
      __crsql_siteid  TEXT,
      __crsql_version INTEGER DEFAULT 0
    );
  `);

  console.log('[DB] Core tables created.');
}

// ─── Medical Tables ───────────────────────────────────────────────────────────

function createMedicalTables(): void {
  run(`
    CREATE TABLE IF NOT EXISTS admissions_assessments (
      assessmentId      TEXT PRIMARY KEY NOT NULL,
      visitId           TEXT NOT NULL UNIQUE REFERENCES visits(visitId),
      neurological      TEXT,
      cardiovascular    TEXT,
      respiratory       TEXT,
      skin              TEXT,
      gastrointestinal  TEXT,
      genitourinary     TEXT,
      carePlanEducation TEXT,
      interventions     TEXT,
      __crsql_siteid    TEXT,
      __crsql_version   INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS medical_intakes (
      intakeId           TEXT PRIMARY KEY NOT NULL,
      visitId            TEXT NOT NULL UNIQUE REFERENCES visits(visitId),
      symptoms           TEXT,
      painLevel          INTEGER,
      painDuration       TEXT,
      painLocations      TEXT,
      painQuality        TEXT,
      quadrant           TEXT,
      antibioticCheckbox INTEGER DEFAULT 0,
      prescriptionMeds   TEXT,
      otcMeds            TEXT,
      herbalRemedies     TEXT,
      carePlan           TEXT,
      clinicalNotes      TEXT,
      __crsql_siteid     TEXT,
      __crsql_version    INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS visit_vitals (
      vitalId         TEXT PRIMARY KEY NOT NULL,
      intakeId        TEXT NOT NULL REFERENCES medical_intakes(intakeId),
      vitalTypeId     TEXT NOT NULL,
      value           TEXT NOT NULL,
      recordedAt      TEXT NOT NULL,
      __crsql_siteid  TEXT,
      __crsql_version INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS visit_conditions (
      visitConditionId  TEXT PRIMARY KEY NOT NULL,
      intakeId          TEXT NOT NULL REFERENCES medical_intakes(intakeId),
      conditionTypeId   TEXT NOT NULL REFERENCES condition_types(conditionTypeId),
      isPrimary         INTEGER DEFAULT 0,
      notes             TEXT,
      __crsql_siteid    TEXT,
      __crsql_version   INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS visit_medications (
      visitMedicationId TEXT PRIMARY KEY NOT NULL,
      intakeId          TEXT NOT NULL REFERENCES medical_intakes(intakeId),
      medicationTypeId  TEXT NOT NULL REFERENCES medication_types(medicationTypeId),
      dosage            TEXT,
      frequency         TEXT,
      durationDays      INTEGER,
      quantity          REAL,
      unitTypeId        TEXT,
      __crsql_siteid    TEXT,
      __crsql_version   INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS medications_dispensed (
      dispensedId           TEXT PRIMARY KEY NOT NULL,
      intakeId              TEXT NOT NULL REFERENCES medical_intakes(intakeId),
      medicationGivenTypeId TEXT,
      quantity              REAL,
      unitTypeId            TEXT,
      __crsql_siteid        TEXT,
      __crsql_version       INTEGER DEFAULT 0
    );
  `);

  console.log('[DB] Medical tables created.');
}

// ─── Dental Tables ────────────────────────────────────────────────────────────

function createDentalTables(): void {
  run(`
    CREATE TABLE IF NOT EXISTS dental_intakes (
      dentalIntakeId    TEXT PRIMARY KEY NOT NULL,
      visitId           TEXT NOT NULL UNIQUE REFERENCES visits(visitId),
      chiefComplaint    TEXT,
      painLevel         INTEGER,
      isEmergency       INTEGER DEFAULT 0,
      oralHygiene       TEXT,
      visibleDecay      TEXT,
      gingivalCondition TEXT,
      toothChart        TEXT,
      infectedTeeth     TEXT,
      diagnosis         TEXT,
      treatmentPerformed TEXT,
      followUp          TEXT,
      dentistNotes      TEXT,
      __crsql_siteid    TEXT,
      __crsql_version   INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS dental_procedures (
      dentalProcedureId TEXT PRIMARY KEY NOT NULL,
      dentalIntakeId    TEXT NOT NULL REFERENCES dental_intakes(dentalIntakeId),
      procedureTypeId   TEXT NOT NULL,
      toothNumber       TEXT,
      notes             TEXT,
      __crsql_siteid    TEXT,
      __crsql_version   INTEGER DEFAULT 0
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS dental_antibiotics (
      dentalAntibioticId TEXT PRIMARY KEY NOT NULL,
      dentalIntakeId     TEXT NOT NULL REFERENCES dental_intakes(dentalIntakeId),
      antibioticTypeId   TEXT NOT NULL,
      dosage             TEXT,
      durationDays       INTEGER,
      __crsql_siteid     TEXT,
      __crsql_version    INTEGER DEFAULT 0
    );
  `);

  console.log('[DB] Dental tables created.');
}

// ─── Inventory Tables ─────────────────────────────────────────────────────────

function createInventoryTables(): void {
  run(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      itemId            TEXT PRIMARY KEY NOT NULL,
      name              TEXT NOT NULL,
      medicationTypeId  TEXT REFERENCES medication_types(medicationTypeId),
      categoryId        TEXT,
      quantity          REAL DEFAULT 0,
      unitTypeId        TEXT,
      warningThreshold  REAL DEFAULT 0,
      expirationDate    TEXT,
      __crsql_siteid    TEXT,
      __crsql_version   INTEGER DEFAULT 0
    );
  `);
  //REFERENCES inventory_categories(inventoryCategoryId) removed from categoryId to allow a list of tags instead of a single category.

  run(`
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      transactionId   TEXT PRIMARY KEY NOT NULL,
      itemId          TEXT NOT NULL REFERENCES inventory_items(itemId),
      visitId         TEXT REFERENCES visits(visitId),
      transactionType TEXT NOT NULL,
      quantityDelta   REAL NOT NULL,
      recordedAt      TEXT NOT NULL,
      __crsql_siteid  TEXT,
      __crsql_version INTEGER DEFAULT 0
    );
  `);

  console.log('[DB] Inventory tables created.');
}

// ─── System Tables ────────────────────────────────────────────────────────────

function createSystemTables(): void {
  run(`
    CREATE TABLE IF NOT EXISTS settings (
      key       TEXT PRIMARY KEY NOT NULL,
      value     TEXT,
      updatedAt TEXT NOT NULL
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS collision_remaps (
      originalPatientId     TEXT NOT NULL,
      originalOriginTablet  TEXT NOT NULL,
      remappedPatientId     TEXT NOT NULL REFERENCES patients(patientId),
      createdAt             TEXT NOT NULL,
      PRIMARY KEY (originalPatientId, originalOriginTablet)
    );
  `);

  console.log('[DB] System tables created.');
}

// ─── Indexes ──────────────────────────────────────────────────────────────────

function createIndexes(): void {
  run(`CREATE INDEX IF NOT EXISTS idx_visits_patientId ON visits(patientId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_visits_checkedInAt ON visits(checkedInAt);`);
  run(`CREATE INDEX IF NOT EXISTS idx_patients_communityId ON patients(communityId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);`);
  run(`CREATE INDEX IF NOT EXISTS idx_patients_arrivalOrder ON patients(arrivalOrder);`);
  run(`CREATE INDEX IF NOT EXISTS idx_patients_familyGroupId ON patients(familyGroupId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_medical_intakes_visitId ON medical_intakes(visitId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_admissions_visitId ON admissions_assessments(visitId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_dental_intakes_visitId ON dental_intakes(visitId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_visit_vitals_intakeId ON visit_vitals(intakeId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_visit_conditions_intakeId ON visit_conditions(intakeId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_visit_medications_intakeId ON visit_medications(intakeId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_medications_dispensed_intakeId ON medications_dispensed(intakeId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_dental_procedures_intakeId ON dental_procedures(dentalIntakeId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_dental_antibiotics_intakeId ON dental_antibiotics(dentalIntakeId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_inventory_transactions_itemId ON inventory_transactions(itemId);`);
  run(`CREATE INDEX IF NOT EXISTS idx_inventory_transactions_visitId ON inventory_transactions(visitId);`);

  console.log('[DB] Indexes created.');
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

function seedDynamicLookups(): void {
  // Medication categories
  const medCategories = [
    ['mc-antibiotic',    'Antibiotic'],
    ['mc-analgesic',     'Analgesic'],
    ['mc-antacid',       'Antacid'],
    ['mc-antiparasitic', 'Antiparasitic'],
    ['mc-antifungal',    'Antifungal'],
    ['mc-topical',       'Topical'],
    ['mc-vitamin',       'Vitamin / Supplement'],
    ['mc-other',         'Other'],
  ];
  for (const [id, label] of medCategories) {
    run(
      `INSERT OR IGNORE INTO medication_categories (medicationCategoryId, label) VALUES (?, ?);`,
      [id, label]
    );
  }

  // Medication types
  const medTypes = [
    ['mt-amoxicillin',    'Amoxicillin',    'mc-antibiotic',    'mg'],
    ['mt-azithromycin',   'Azithromycin',   'mc-antibiotic',    'mg'],
    ['mt-metronidazole',  'Metronidazole',  'mc-antibiotic',    'mg'],
    ['mt-ciprofloxacin',  'Ciprofloxacin',  'mc-antibiotic',    'mg'],
    ['mt-doxycycline',    'Doxycycline',    'mc-antibiotic',    'mg'],
    ['mt-ibuprofen',      'Ibuprofen',      'mc-analgesic',     'mg'],
    ['mt-acetaminophen',  'Acetaminophen',  'mc-analgesic',     'mg'],
    ['mt-naproxen',       'Naproxen',       'mc-analgesic',     'mg'],
    ['mt-pepcid',         'Pepcid',         'mc-antacid',       'mg'],
    ['mt-omeprazole',     'Omeprazole',     'mc-antacid',       'mg'],
    ['mt-muscle-cream',   'Muscle Cream',   'mc-topical',       'g'],
    ['mt-silver-nitrate', 'Silver Nitrate', 'mc-topical',       'ml'],
    ['mt-albendazole',    'Albendazole',    'mc-antiparasitic', 'mg'],
    ['mt-ivermectin',     'Ivermectin',     'mc-antiparasitic', 'mg'],
    ['mt-fluconazole',    'Fluconazole',    'mc-antifungal',    'mg'],
    ['mt-vitamins',       'Multivitamins',  'mc-vitamin',       'tablet'],
  ];
  for (const [id, name, catId, unit] of medTypes) {
    run(
      `INSERT OR IGNORE INTO medication_types (medicationTypeId, name, categoryId, defaultUnit) VALUES (?, ?, ?, ?);`,
      [id, name, catId, unit]
    );
  }

  // Inventory categories
  const invCategories = [
    ['ic-medication',  'Medication'],
    ['ic-supply',      'Medical Supply'],
    ['ic-dental',      'Dental Supply'],
    ['ic-equipment',   'Equipment'],
  ];
  for (const [id, label] of invCategories) {
    run(
      `INSERT OR IGNORE INTO inventory_categories (inventoryCategoryId, label) VALUES (?, ?);`,
      [id, label]
    );
  }

  // Condition types
  const conditions = [
    ['ct-hypertension',      'Hypertension',           'I10'],
    ['ct-diabetes-t2',       'Type 2 Diabetes',         'E11'],
    ['ct-gerd',              'GERD / Gastritis',        'K21'],
    ['ct-uti',               'UTI',                     'N39.0'],
    ['ct-respiratory-inf',   'Respiratory Infection',   'J06.9'],
    ['ct-skin-infection',    'Skin Infection',           'L08.9'],
    ['ct-parasitic',         'Parasitic Infection',     'B82.9'],
    ['ct-anxiety',           'Anxiety',                 'F41.1'],
    ['ct-depression',        'Depression',              'F32.9'],
    ['ct-musculoskeletal',   'Musculoskeletal Pain',    'M79.3'],
    ['ct-wound',             'Wound / Laceration',      'T14.0'],
    ['ct-dental-caries',     'Dental Caries',           'K02'],
    ['ct-dental-abscess',    'Dental Abscess',          'K04.7'],
    ['ct-other',             'Other',                   null],
  ];
  for (const [id, label, icd10] of conditions) {
    run(
      `INSERT OR IGNORE INTO condition_types (conditionTypeId, label, icd10Code) VALUES (?, ?, ?);`,
      [id, label, icd10]
    );
  }

  console.log('[DB] Seed data inserted.');
}

// ─── CRDT — Enable cr-sqlite ──────────────────────────────────────────────────
// Marks tables as Conflict-free Replicated Relations (CRRs).
// Only dynamic/sync-relevant tables are marked.
// Static lookups (settings) excluded.

function enableCRDT(): void {
  const crrTables = [
    'communities', 'condition_types', 'medication_categories',
    'medication_types', 'inventory_categories',
    'patients', 'visits', 'visit_services',
    'admissions_assessments', 'medical_intakes', 'visit_vitals',
    'visit_conditions', 'visit_medications', 'medications_dispensed',
    'dental_intakes', 'dental_procedures', 'dental_antibiotics',
    'inventory_items', 'inventory_transactions', 'collision_remaps',
  ];

  for (const table of crrTables) {
    try {
      run(`SELECT crsql_as_crr('${table}');`);
    } catch (e) {}
  }

  console.log(`[DB] CRDT setup complete.`);
}