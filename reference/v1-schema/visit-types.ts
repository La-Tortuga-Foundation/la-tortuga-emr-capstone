/**
 * Visit Type Definitions
 * Represents a clinic day session linking Medical and Dental services
 */

export type VisitStatus = 'open' | 'in-progress' | 'complete' | 'synced';

export interface VisitServices {
  medical?: {
    touched: boolean;
    completedAt?: number;
    recordId?: string;
  };
  dental?: {
    touched: boolean;
    completedAt?: number;
    recordId?: string;
  };
}

export interface Visit {
  visitId: string; // UUID v4
  patientId: string; // Reference to patient record
  clinicId: string; // Reference to clinic/mission
  status: VisitStatus;
  services: VisitServices;
  shortCode: string; // 6-char human-friendly code (e.g., K3F-72B)
  openedAt: number; // ms epoch timestamp
  updatedAt: number; // ms epoch timestamp
  originTablet: string; // Which tablet created this visit
  lastSyncedAt: number; // Last time this record was synced (0 = never)
  syncVersion: number; // Incremented on each update for conflict resolution
}

export interface CreateVisitParams {
  patientId: string;
  clinicId: string;
}
