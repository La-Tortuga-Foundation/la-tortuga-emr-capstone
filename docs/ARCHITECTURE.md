# Architecture Overview

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  (React Native Components - Medical/Dental Forms, Queue)     │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Application Logic Layer                    │
│         (Redux State Management, Business Logic)             │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
┌───────────────▼────────────┐  ┌──────────▼────────────────┐
│    Data Persistence Layer   │  │  Network Sync Layer       │
│  (SQLite + SQLCipher)       │  │  (WiFi Direct P2P Mesh)   │
└───────────────┬────────────┘  └──────────┬────────────────┘
                │                           │
┌───────────────▼───────────────────────────▼─────────────────┐
│                     Security Layer                           │
│         (Samsung Knox Hardware Encryption)                   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. User Interface Layer

#### Medical Intake Components
- **PatientIntakeForm**: Spanish/English bilingual patient history
- **VitalsRecorder**: Blood pressure, temperature, heart rate, etc.
- **SystemsReview**: Body system checkboxes (neuro, cardiac, respiratory, etc.)
- **TreatmentPlan**: Medication prescriptions, procedures
- **WoundCare**: Dressing types, wound assessment

#### Dental Components
- **DentalChart**: 32-tooth interactive map
- **ToothSelector**: Dropdown for painful/caries/fractured teeth
- **ProcedureTracker**: Cleanings, extractions, X-rays
- **DentalNotes**: Free-text clinical observations

#### Queue Management
- **PriorityQueue**: Auto-sorted patient list (critical → routine)
- **PatientCard**: Status, vitals summary, wait time
- **QueueControls**: Add, update status, complete visit

#### Inventory Management
- **InventoryList**: Medications, supplies with quantities
- **LowStockAlerts**: Real-time notifications across tablets
- **UsageTracker**: Log consumption per patient

#### Common Components
- **LoginScreen**: Provider authentication
- **PatientSearch**: Find existing patients
- **SyncStatus**: Visual indicator of P2P connection state
- **LanguageToggle**: Switch between Spanish/English

### 2. Application Logic Layer

#### State Management (Redux Toolkit)

```javascript
store/
├── slices/
│   ├── authSlice.js          // User authentication state
│   ├── patientSlice.js       // Patient records CRUD
│   ├── queueSlice.js         // Priority queue management
│   ├── inventorySlice.js     // Stock levels, alerts
│   ├── syncSlice.js          // P2P sync state, pending changes
│   └── settingsSlice.js      // Language, preferences
├── middleware/
│   ├── syncMiddleware.js     // Intercept actions for P2P broadcast
│   ├── persistMiddleware.js  // Save to SQLite
│   └── encryptMiddleware.js  // Encrypt before persistence
└── store.js                  // Configure store with middleware
```

#### Business Logic Services

```javascript
services/
├── patient/
│   ├── PatientService.js     // CRUD operations
│   ├── ValidationService.js  // Form validation rules
│   └── SearchService.js      // Patient search/filtering
├── queue/
│   ├── QueueService.js       // Priority sorting algorithm
│   └── NotificationService.js // Alert providers
├── inventory/
│   ├── InventoryService.js   // Stock tracking
│   └── AlertService.js       // Low stock notifications
└── auth/
    └── AuthService.js        // Login, session management
```

### 3. Data Persistence Layer

#### SQLite Schema

```sql
-- Patients table
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT,
    village TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    version INTEGER,  -- For conflict resolution
    is_deleted INTEGER DEFAULT 0
);

-- Medical records
CREATE TABLE medical_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    visit_date INTEGER,
    chief_complaint TEXT,
    vitals TEXT,  -- JSON: { bp, temp, hr, rr, o2sat }
    systems_review TEXT,  -- JSON: { neuro: [], cardiac: [], ... }
    medications TEXT,  -- JSON array
    procedures TEXT,  -- JSON array
    notes TEXT,
    provider_id TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    version INTEGER,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Dental records
CREATE TABLE dental_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    visit_date INTEGER,
    painful_teeth TEXT,  -- JSON array of tooth numbers
    caries_teeth TEXT,
    fractured_teeth TEXT,
    procedures TEXT,  -- JSON: { cleanings: 2, extractions: [5, 12] }
    antibiotics TEXT,  -- JSON: { type, dosage, duration }
    notes TEXT,
    provider_id TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    version INTEGER,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Queue
CREATE TABLE queue (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    priority INTEGER,  -- 1=Critical, 2=Urgent, 3=Routine
    status TEXT,  -- waiting, in_progress, completed
    wait_time INTEGER,
    assigned_provider TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Inventory
CREATE TABLE inventory (
    id TEXT PRIMARY KEY,
    item_name TEXT,
    category TEXT,  -- medication, supply, equipment
    quantity INTEGER,
    unit TEXT,
    threshold INTEGER,  -- Alert when below this
    location TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    version INTEGER
);

-- Sync metadata
CREATE TABLE sync_log (
    id TEXT PRIMARY KEY,
    table_name TEXT,
    record_id TEXT,
    operation TEXT,  -- insert, update, delete
    data TEXT,  -- JSON snapshot
    timestamp INTEGER,
    device_id TEXT,
    synced INTEGER DEFAULT 0
);
```

#### SQLCipher Integration

```javascript
// Database initialization with encryption
import SQLite from 'react-native-sqlite-storage';
import { getKnoxKey } from './KnoxService';

const initDatabase = async () => {
  const encryptionKey = await getKnoxKey();
  
  const db = await SQLite.openDatabase({
    name: 'latortuga.db',
    location: 'default',
    key: encryptionKey,  // SQLCipher encryption
  });
  
  // Enable foreign keys
  await db.executeSql('PRAGMA foreign_keys = ON');
  
  return db;
};
```

### 4. Network Sync Layer

#### WiFi Direct P2P Mesh

```javascript
services/sync/
├── WiFiDirectManager.js      // Android WiFi Direct API wrapper
├── PeerDiscovery.js          // Find nearby tablets
├── ConnectionManager.js      // Establish P2P connections
├── GossipProtocol.js         // Broadcast updates to peers
├── ConflictResolver.js       // CRDT-based merge logic
└── SyncQueue.js              // Pending changes queue
```

#### Gossip Protocol Flow

```
Tablet A updates patient vitals
    ↓
1. Save to local SQLite
    ↓
2. Add to sync_log table
    ↓
3. Broadcast to all connected peers (Tablets B, C, D, E, F)
    ↓
4. Peers receive update
    ↓
5. Peers check version vector
    ↓
6. If newer → apply update
   If conflict → merge using CRDT rules
   If older → ignore
    ↓
7. Peers broadcast to their peers (gossip)
    ↓
8. Eventually consistent across all tablets
```

#### CRDT Conflict Resolution

**Last-Write-Wins (LWW) with Timestamp**
- Each update has timestamp + device_id
- Conflicts resolved by most recent timestamp
- Tie-breaker: lexicographically compare device_id

```javascript
const mergePatientRecords = (local, remote) => {
  if (remote.updated_at > local.updated_at) {
    return remote;  // Remote is newer
  } else if (remote.updated_at < local.updated_at) {
    return local;   // Local is newer
  } else {
    // Same timestamp - use device_id as tie-breaker
    return remote.device_id > local.device_id ? remote : local;
  }
};
```

**Field-Level Merging for Complex Objects**
```javascript
const mergeVitals = (localVitals, remoteVitals, timestamp) => {
  return {
    bp: remoteVitals.bp_timestamp > timestamp.bp ? remoteVitals.bp : localVitals.bp,
    temp: remoteVitals.temp_timestamp > timestamp.temp ? remoteVitals.temp : localVitals.temp,
    // ... merge each field independently
  };
};
```

### 5. Security Layer

#### Samsung Knox Integration

```javascript
services/security/
├── KnoxService.js            // Knox API wrapper
├── KeyManager.js             // Hardware key generation/storage
├── EncryptionService.js      // Encrypt/decrypt utilities
└── RemoteWipeService.js      // Device wipe on theft
```

#### Encryption Flow

```
Patient data entered
    ↓
1. Serialize to JSON
    ↓
2. Get hardware-backed key from Knox
    ↓
3. Encrypt with AES-256
    ↓
4. Save encrypted blob to SQLCipher
    ↓
5. Clear plaintext from memory
```

#### Security Features

- **Hardware-Backed Keys**: Knox stores encryption keys in secure hardware (TrustZone)
- **At-Rest Encryption**: SQLCipher encrypts entire database file
- **In-Transit Encryption**: WiFi Direct traffic encrypted with TLS
- **Access Control**: PIN/biometric authentication required
- **Audit Logging**: All PHI access logged with timestamp + user
- **Remote Wipe**: Lost/stolen tablets can be wiped remotely when they reconnect

## Data Flow Examples

### Example 1: Patient Intake

```
1. Provider opens PatientIntakeForm
2. Selects language (Spanish for patient, English for provider)
3. Fills out history (checkboxes for systems review)
4. Records vitals
5. Saves form
    ↓
6. Form validation (yup schema)
7. Dispatch action: patientSlice.createPatient()
8. Middleware: Encrypt patient data
9. Service: Save to SQLite
10. Middleware: Add to sync_log
11. Service: Broadcast to peers via WiFi Direct
12. Peers receive and apply update
13. UI updates across all tablets
```

### Example 2: Priority Queue Update

```
1. Nurse triages patient as "Critical"
2. Updates queue status
    ↓
3. Dispatch action: queueSlice.updatePriority()
4. Service: Calculate new queue order
5. Middleware: Save to SQLite
6. Middleware: Broadcast to peers
7. All tablets receive update
8. Queue re-renders with new order (critical → top)
9. Notification sent to assigned provider
```

### Example 3: Inventory Alert

```
1. Provider dispenses last bottle of amoxicillin
2. Updates inventory: quantity = 0
    ↓
3. Dispatch action: inventorySlice.updateQuantity()
4. Service: Check if quantity < threshold
5. Threshold triggered (0 < 5)
6. Middleware: Broadcast to all peers
7. AlertService: Show notification on all tablets
8. Notification: "Amoxicillin depleted - reorder needed"
```

## Scalability Considerations

### Current Scope (6 Tablets)
- Direct mesh works well
- All tablets connect to all others (full mesh)
- Gossip protocol handles ~500 patients per mission

### Future Scaling (20+ Tablets)
- Implement hierarchical clustering
- Elect "cluster heads" to reduce broadcast traffic
- Add cloud sync for long-term storage
- Implement pagination for large patient lists

## Performance Optimizations

### Database
- Index frequently queried fields (patient name, date)
- Use transactions for batch operations
- Cache query results with TTL
- Lazy load patient history (only when opened)

### Sync
- Batch small updates (debounce 500ms)
- Compress payloads before transmission
- Use delta sync (only changed fields)
- Prioritize critical updates (queue > inventory > notes)

### UI
- Virtualized lists for large datasets
- Memoize expensive components
- Lazy load heavy screens
- Optimize re-renders with React.memo

## Error Handling

### Network Errors
- Retry failed syncs (exponential backoff)
- Queue updates locally until connection restored
- Show sync status indicator

### Database Errors
- Automatic backup before risky operations
- Transaction rollback on failure
- Corrupted DB detection and recovery

### Validation Errors
- Client-side validation before save
- Show inline error messages
- Prevent submission until resolved

## Monitoring & Logging

### Metrics to Track
- Sync latency (time from update to peer receipt)
- Conflict frequency
- Database size growth
- Battery drain from WiFi Direct
- Form completion time

### Logging Strategy
- Info: Normal operations (patient created, synced)
- Warn: Recoverable issues (sync retry, low battery)
- Error: Critical failures (DB corruption, encryption failure)
- No PHI in logs (use record IDs only)

## Disaster Recovery

### Data Loss Scenarios
1. **Tablet theft/damage**: Data replicated on other 5 tablets
2. **All tablets lost**: Cloud backup (if synced before loss)
3. **Database corruption**: Restore from peer tablet
4. **Sync conflict loop**: Manual intervention, version rollback

### Backup Strategy
- Real-time P2P replication (6 copies)
- Daily cloud sync when internet available
- Export to encrypted archive on mission completion

## Future Architecture Enhancements

### Phase 2 Features
- [ ] Photo attachments (wound photos, X-rays)
- [ ] Voice-to-text for clinical notes
- [ ] Cloud dashboard for mission analytics
- [ ] Integration with local health ministry systems

### Phase 3 Features
- [ ] AI-assisted diagnosis suggestions
- [ ] Predictive inventory management
- [ ] Telemedicine integration
- [ ] Multi-mission historical patient tracking

---

This architecture prioritizes:
1. **Reliability**: No data loss in offline conditions
2. **Security**: HIPAA-compliant PHI protection
3. **Usability**: Fast, intuitive interface for non-technical users
4. **Scalability**: Ready to grow beyond initial 6-tablet deployment
