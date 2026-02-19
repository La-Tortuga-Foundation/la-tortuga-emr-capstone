export interface Patient {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  checkInTime: number;
}