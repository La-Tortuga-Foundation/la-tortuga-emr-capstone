# Database Schema

## Overview
The La Tortuga EMR uses SQLite with SQLCipher encryption for local data storage. All PHI (Protected Health Information) is encrypted at rest using Samsung Knox hardware-backed keys.

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Patients   │1──────*│ Medical_Records  │         │  Dental_Records │
│             │         │                  │         │                 │
│ - id (PK)   │         │ - id (PK)        │         │ - id (PK)       │
│ - first_name│         │ - patient_id (FK)│         │ - patient_id(FK)│
│ - last_name │         │ - visit_date     │         │ - visit_date    │
│ - dob       │         │ - vitals (JSON)  │         │ - procedures    │
│ - gender    │         │ - medications    │         │ - antibiotics   │
│ - village   │         │ - provider_id    │         │ - provider_id   │
  - Status  
└─────────────┘         └──────────────────┘         └─────────────────┘
       
       
       
┌──────────────────┐
│    Inventory     │
│                  │
│ - id (PK)        │
│ - item_name      │
│ - quantity       │
│ - threshold      │
│ - category       │
|  - qty_type      |
└──────────────────┘
```

## Table Schemas

### Patients

Stores patient demographic information.

```sql
CREATE TABLE patients (
    id TEXT PRIMARY KEY,                    -- UUID v4
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,                     -- ISO 8601 format: YYYY-MM-DD
    gender TEXT CHECK(gender IN ('M', 'F', 'Other')),
    village TEXT,                           -- Community/village name
    phone TEXT,
    emergency_contact TEXT,
    allergies TEXT,                         -- JSON array of allergy strings
    created_at INTEGER NOT NULL,            -- Unix timestamp
    updated_at INTEGER NOT NULL,            -- Unix timestamp
    version INTEGER NOT NULL DEFAULT 1,     -- For CRDT conflict resolution
    device_id TEXT NOT NULL,                -- Device that created/last updated
    is_deleted INTEGER DEFAULT 0,           -- Soft delete flag
    sync_status TEXT DEFAULT 'synced'       -- synced, pending, conflict
);

CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_village ON patients(village);
CREATE INDEX idx_patients_updated ON patients(updated_at);
```

### Medical_Records

Stores medical visit data including vitals, history, and treatment.

```sql
CREATE TABLE medical_records (
    id TEXT PRIMARY KEY,                    -- UUID v4
    patient_id TEXT NOT NULL,
    visit_date INTEGER NOT NULL,            -- Unix timestamp
    chief_complaint TEXT,
    
    -- Vitals (stored as JSON for flexibility)
    vitals TEXT,                            -- { "bp": "120/80", "temp": 98.6, "hr": 72, "rr": 16, "o2sat": 98, "weight": 150, "height": 170 }
    vitals_timestamp INTEGER,
    
    -- Systems Review (JSON with arrays of findings)
    systems_review TEXT,                    -- { "neuro": ["headache", "dizziness"], "cardiac": [], "respiratory": ["cough"], ... }
    
    -- Medications (JSON array)
    medications TEXT,                       -- [{ "name": "Tylenol", "dosage": "500mg", "frequency": "q6h", "duration": "3 days", "quantity": 12 }]
    
    -- Procedures performed (JSON array)
    procedures TEXT,                        -- [{ "name": "Blood pressure check", "time": timestamp }]
    
    -- Wound Care
    wound_care TEXT,                        -- { "location": "left leg", "size": "2cm", "dressing": "gauze", "notes": "..." }
    
    -- Free-text clinical notes
    notes TEXT,
    
    -- Provider information
    provider_id TEXT NOT NULL,              -- Staff member ID
    provider_name TEXT,
    
    -- Metadata
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    device_id TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX idx_medical_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_visit_date ON medical_records(visit_date);
CREATE INDEX idx_medical_provider ON medical_records(provider_id);
```

### Dental_Records

Stores dental visit data including tooth assessments and procedures.

```sql
CREATE TABLE dental_records (
    id TEXT PRIMARY KEY,                    -- UUID v4
    patient_id TEXT NOT NULL,
    visit_date INTEGER NOT NULL,
    
    -- Tooth assessments (arrays of tooth numbers 1-32)
    painful_teeth TEXT,                     -- JSON: [5, 12, 18]
    caries_teeth TEXT,                      -- JSON: [3, 14, 28]
    fractured_teeth TEXT,                   -- JSON: [7, 20]
    
    -- Procedures performed
    procedures TEXT,                        -- JSON: { "general_cleanings": 1, "deep_cleanings": 0, "extractions": [5, 12], "fillings": [14], "xrays": 2 }
    
    -- Medications
    antibiotics TEXT,                       -- JSON: { "type": "amoxicillin", "dosage": "500mg", "pills": 28, "duration": "7 days" }
    pain_meds TEXT,                         -- JSON: { "type": "ibuprofen", "dosage": "400mg", "pills": 21 }
    
    -- Free-text notes
    notes TEXT,
    
    -- Provider information
    provider_id TEXT NOT NULL,
    provider_name TEXT,
    
    -- Metadata
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    device_id TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX idx_dental_patient ON dental_records(patient_id);
CREATE INDEX idx_dental_visit_date ON dental_records(visit_date);
```

### Queue

Manages patient priority queue for clinic operations.

```sql
CREATE TABLE queue (
    id TEXT PRIMARY KEY,                    -- UUID v4
    patient_id TEXT NOT NULL,
    priority INTEGER NOT NULL CHECK(priority IN (1, 2, 3)),  -- 1=Critical, 2=Urgent, 3=Routine
    status TEXT NOT NULL CHECK(status IN ('waiting', 'in_progress', 'completed')),
    wait_time INTEGER,                      -- Minutes waited
    assigned_provider TEXT,
    notes TEXT,
    
    -- Timestamps
    added_at INTEGER NOT NULL,              -- When added to queue
    started_at INTEGER,                     -- When treatment started
    completed_at INTEGER,                   -- When treatment completed
    
    -- Metadata
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    device_id TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX idx_queue_status ON queue(status, priority);
CREATE INDEX idx_queue_patient ON queue(patient_id);
CREATE INDEX idx_queue_provider ON queue(assigned_provider);
```

### Inventory

Tracks medication and supply levels.

```sql
CREATE TABLE inventory (
    id TEXT PRIMARY KEY,                    -- UUID v4
    item_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('medication', 'supply', 'equipment')),
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,                     -- pills, bottles, boxes, etc.
    threshold INTEGER NOT NULL DEFAULT 5,   -- Alert when quantity <= threshold
    location TEXT,                          -- Where stored
    expiration_date TEXT,                   -- ISO 8601 format
    
    -- Metadata
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    device_id TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0
);

CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity) WHERE quantity <= threshold;
CREATE INDEX idx_inventory_name ON inventory(item_name);
```

### Inventory_Transactions

Logs inventory usage for auditing.

```sql
CREATE TABLE inventory_transactions (
    id TEXT PRIMARY KEY,                    -- UUID v4
    inventory_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('add', 'dispense', 'adjust', 'expire')),
    quantity_change INTEGER NOT NULL,       -- Positive for add, negative for dispense
    quantity_after INTEGER NOT NULL,
    patient_id TEXT,                        -- If dispensed to patient
    provider_id TEXT,
    notes TEXT,
    
    -- Metadata
    created_at INTEGER NOT NULL,
    device_id TEXT NOT NULL,
    
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE INDEX idx_inv_trans_inventory ON inventory_transactions(inventory_id);
CREATE INDEX idx_inv_trans_patient ON inventory_transactions(patient_id);
CREATE INDEX idx_inv_trans_date ON inventory_transactions(created_at);
```

### Sync_Log

Tracks all changes for P2P synchronization.

```sql
CREATE TABLE sync_log (
    id TEXT PRIMARY KEY,                    -- UUID v4
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK(operation IN ('insert', 'update', 'delete')),
    data TEXT NOT NULL,                     -- JSON snapshot of the record
    timestamp INTEGER NOT NULL,             -- Unix timestamp
    device_id TEXT NOT NULL,                -- Device that made the change
    synced INTEGER DEFAULT 0,               -- 0 = pending, 1 = synced to all peers
    sync_attempts INTEGER DEFAULT 0,
    last_sync_attempt INTEGER
);

CREATE INDEX idx_sync_pending ON sync_log(synced) WHERE synced = 0;
CREATE INDEX idx_sync_timestamp ON sync_log(timestamp);
CREATE INDEX idx_sync_record ON sync_log(table_name, record_id);
```

### Providers

Stores information about medical/dental staff.

```sql
CREATE TABLE providers (
    id TEXT PRIMARY KEY,                    -- UUID v4
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,            -- Hashed password (never plaintext)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('doctor', 'nurse', 'dentist', 'admin')),
    active INTEGER DEFAULT 1,
    
    -- Metadata
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_login INTEGER
);

CREATE INDEX idx_providers_username ON providers(username);
```

## Data Types

### JSON Field Formats

**Vitals**
```json
{
  "bp": "120/80",
  "temp": 98.6,
  "hr": 72,
  "rr": 16,
  "o2sat": 98,
  "weight": 150,
  "height": 170,
  "bmi": 24.5,
  "pain_level": 3
}
```

**Systems Review**
```json
{
  "neuro": ["headache", "dizziness"],
  "cardiac": [],
  "respiratory": ["cough", "shortness_of_breath"],
  "gi": ["nausea"],
  "musculoskeletal": ["back_pain"],
  "skin": ["rash"],
  "endocrine": ["diabetes"],
  "psychiatric": []
}
```

**Medications**
```json
[
  {
    "name": "Tylenol",
    "dosage": "500mg",
    "frequency": "q6h",
    "duration": "3 days",
    "quantity": 12,
    "prescribed_at": 1706198400
  },
  {
    "name": "Amoxicillin",
    "dosage": "500mg",
    "frequency": "tid",
    "duration": "7 days",
    "quantity": 21,
    "prescribed_at": 1706198400
  }
]
```

**Dental Procedures**
```json
{
  "general_cleanings": 1,
  "deep_cleanings": 0,
  "extractions": [5, 12],
  "fillings": [14, 28],
  "xrays": 2,
  "fluoride": true
}
```

## Migration Strategy

### Initial Setup
```sql
-- migrations/001_initial_schema.sql
-- Run on first app launch
-- Creates all tables with initial schema
```

### Version Updates
```sql
-- migrations/002_add_wound_care.sql
-- Adds wound_care column to medical_records
ALTER TABLE medical_records ADD COLUMN wound_care TEXT;
```

## Data Integrity

### Constraints
- All IDs are UUIDs to prevent collisions across devices
- Foreign keys enforce referential integrity
- Check constraints validate enum-like fields
- NOT NULL constraints prevent missing required data

### Soft Deletes
- `is_deleted` flag instead of hard deletes
- Allows sync of deletions across devices
- Data can be recovered if needed

### Conflict Resolution
- `version` field increments on each update
- `device_id` tracks which tablet made the change
- `updated_at` timestamp for last-write-wins resolution

## Performance Optimization

### Indexes
- Composite indexes on frequently queried columns
- Partial indexes for filtered queries (e.g., pending sync)
- Cover queries without full table scans

### Query Optimization
```sql
-- Good: Uses index
SELECT * FROM patients WHERE last_name = 'Garcia';

-- Bad: Full table scan
SELECT * FROM patients WHERE LOWER(last_name) = 'garcia';

-- Good: Use prepared statements
-- Prevents SQL injection and improves performance
```

### Transaction Batching
```javascript
// Good: Single transaction for multiple inserts
db.transaction(tx => {
  patients.forEach(patient => {
    tx.executeSql('INSERT INTO patients ...', [patient]);
  });
});

// Bad: Individual transactions
patients.forEach(patient => {
  db.executeSql('INSERT INTO patients ...', [patient]);
});
```

## Security Considerations

### Encryption
- Entire database encrypted with SQLCipher
- Encryption key derived from Samsung Knox hardware
- No plaintext PHI on disk

### Access Control
- Provider authentication required
- Role-based access (doctor, nurse, dentist, admin)
- Audit trail of all PHI access

### Data Sanitization
```javascript
// Always use parameterized queries
const query = 'SELECT * FROM patients WHERE id = ?';
db.executeSql(query, [patientId]);

// NEVER concatenate user input
// const query = `SELECT * FROM patients WHERE id = '${patientId}'`; // SQL INJECTION RISK!
```

## Backup & Recovery

### Local Backups
- Automatic daily backups to device storage
- Encrypted backup files
- Keep last 7 days of backups

### Cloud Sync
- Upload to Firebase/AWS when internet available
- Encrypted before upload
- Version history maintained

### Disaster Recovery
- Restore from peer tablets (P2P replication)
- Restore from cloud backup
- Manual export to encrypted archive

---

**Last Updated**: January 26, 2026
**Schema Version**: 1.0.0
