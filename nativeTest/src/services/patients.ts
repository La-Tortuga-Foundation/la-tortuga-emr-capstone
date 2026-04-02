import { Patient } from '@/app/pages/interfaces/PatientInterface';
import { run, queryOne, query } from './db';
import { isClientConnected, sendHandshakeOnExistingConnection } from './syncSocket';

function generateId(): string {
  //why p? seems redundant
  return 'p-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function createPatient( //returns patientId
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  communityId?: string,
  service?: string,
  familyGroupId?: string
): string {
  const patientId = generateId();
  const arrivalOrder = getNextArrivalOrder();

run(
  `INSERT INTO patients (patientId, firstName, lastName, dateOfBirth, communityId, status, arrivalOrder, __crsql_version)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    patientId,
    firstName,
    lastName,
    dateOfBirth,
    communityId || null,
    'waiting',
    arrivalOrder,
    1,
  ]
);


  console.log(`[PATIENTS] Created patient ${patientId} — ${firstName} ${lastName}`);

  if (isClientConnected()) {
    console.log('[PATIENTS] New patient — triggering sync on existing connection');
    setTimeout(() => sendHandshakeOnExistingConnection(), 100);
  }

  return patientId;
}

function getNextArrivalOrder(): number {
  const result = queryOne<{ maxOrder: number }>(
    `SELECT MAX(arrivalOrder) as maxOrder FROM patients`
  );
  return (result?.maxOrder || 0) + 1;
}

export function getPatientById(patientId: string) {
   return queryOne<Patient>(
    `SELECT * FROM patients WHERE patientId = ?`, [patientId]
   );
}

  export function loadPatientInfo(patientId: string) {
    //patient is expected to be a Type of Patient.
  const patient = queryOne<Patient>(`SELECT * FROM patients WHERE patientId = ?`, [patientId]);
  return patient;   
   
  }

  export function updatePatient(patientId: string, firstName:string, lastName:string, dateOfBirth:string){
    try{
    run(`update patients SET firstName = ?, 
      lastName = ?, dateOfBirth = ? WHERE patientId = ? `, [firstName, lastName, dateOfBirth, patientId]);
    } catch(e: any){
      console.error(`[PATIENTS] Failed to update patient ${patientId}:`, e.message);
    }
    
      
  }