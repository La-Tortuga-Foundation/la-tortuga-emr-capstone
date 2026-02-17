export interface Patient {
  id: string;
  name: string;
  priority: "high" | "medium" | "normal";
  checkInTime: number;
}