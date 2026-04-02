// export interface Patient {
//   id: string;
//   name: string;
//   priority: "high" | "medium" | "low";
//   checkInTime: number;
//   status: "completed" | "waiting";
// }
export interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  communityId?: string;
  status: 'waiting' | 'completed';
  priority: number;
  arrivalOrder: number;
}