import { run, query, queryOne } from './db';

function generateId(): string {
  return 'v-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function createVisit(
  patientId: string,
  reasonForVisit: string,
  reasonForVisitTag: string,
  isUrgent: boolean,
  urgentTrigger?: string
): string {
  const visitId = generateId();
  const status = isUrgent ? 'urgent' : 'waiting';

  run(
  `INSERT INTO visits (visitId, patientId, statusTypeId, reasonForVisit, reasonForVisitTag, checkedInAt, __crsql_version)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    visitId,
    patientId,
    status,
    reasonForVisit,
    urgentTrigger || reasonForVisitTag,
    new Date().toISOString(),
    1,
  ]
);

  console.log(`[VISITS] Created visit ${visitId} — status: ${status}`);
  return visitId;
}

export function getWaitingRoomVisits() {
  return query(`
    SELECT 
      v.visitId,
      v.statusTypeId,
      v.reasonForVisit,
      v.reasonForVisitTag,
      v.checkedInAt,
      p.firstName,
      p.lastName,
      p.arrivalOrder,
      p.communityId
    FROM visits v
    JOIN patients p ON v.patientId = p.patientId
    ORDER BY 
      CASE v.statusTypeId WHEN 'urgent' THEN 0 ELSE 1 END,
      p.arrivalOrder ASC
  `);
}