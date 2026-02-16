/**
 * Patient Type Definitions
 * Represents a patient record for offline EMR system
 */

export interface Patient {
  patientId: string; // Format: PT-{tabletPrefix}-{sequence} e.g., PT-A-001
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  phone?: string;
  notes?: string;
  createdAt: number; // ms epoch timestamp
  updatedAt: number; // ms epoch timestamp
  originTablet: string; // Which tablet created this patient
  lastSyncedAt: number; // Last time this record was synced (0 = never)
  syncVersion: number; // Incremented on each update for conflict resolution
}

export interface CreatePatientParams {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  notes?: string;
  tabletPrefix: string; // e.g., 'A', 'B', 'C'
}

export interface SearchPatientParams {
  query: string; // Search by firstName, lastName, or phone
}
