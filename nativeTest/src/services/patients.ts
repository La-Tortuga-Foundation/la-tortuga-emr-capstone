import { run, queryOne, query } from './db';

function generateId(): string {
  return 'p-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function createPatient(
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
    `INSERT INTO patients (patientId, firstName, lastName, dateOfBirth, communityId, status, arrivalOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      patientId,
      firstName,
      lastName,
      dateOfBirth,
      communityId || null,
      'waiting',
      arrivalOrder,
    ]
  );



  console.log(`[PATIENTS] Created patient ${patientId} — ${firstName} ${lastName}`);
  return patientId;
}

function getNextArrivalOrder(): number {
  const result = queryOne<{ maxOrder: number }>(
    `SELECT MAX(arrivalOrder) as maxOrder FROM patients`
  );
  return (result?.maxOrder || 0) + 1;
}