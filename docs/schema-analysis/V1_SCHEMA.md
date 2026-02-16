# V1 Database Schema Analysis

**Source:** La-Tortuga-Foundation/emr-app  
**Branch:** main  
**File:** src/services/db.ts  
**Date Analyzed:** February 16, 2026  
**Analyzed by:** Jose Rodriguez (@jmr988)

---

## Overview

V1 uses **SQLite** (via expo-sqlite) for local data storage with P2P mesh sync.

**Database File:** la_tortuga.db  
**Technology:** React Native + Expo + SQLite

---

## V1 Tables

### 1. patients
Patient demographics with P2P sync metadata

### 2. visits
Visit tracking with short codes for cross-tablet handoff

### 3. medical_intake_records
Medical form data stored as JSON

### 4. dental_intake_records
Dental form data stored as JSON

### 5. settings
App configuration (local only, not synced)

---

## P2P Sync Fields

All synced tables include:
- `originTablet` - Tablet that created the record
- `lastSyncedAt` - Last sync timestamp
- `syncVersion` - Conflict resolution counter

---

## V2 Migration Strategy

### Keep Identical
- All 5 V1 tables must remain unchanged
- All V1 indexes must be preserved
- All V1 data types must match exactly

### V2 Additions (Safe)
- Add NEW tables for V2 features (photos, analytics, etc.)
- Do NOT modify V1 tables

### Never Do
- Modify V1 table structure
- Rename V1 columns
- Change V1 data types

---

## References

Complete V1 schema: `reference/v1-schema/db.ts`

---

**Last Updated:** February 16, 2026