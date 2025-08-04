export type ViewType = "week" | "month" | "day";

export interface Appointment {
  id: string;
  title: string;
  client: string;
  time: string;
  duration: number; // em minutos
  day: number; // 0-6 (domingo a sábado)
  employee: string;
  status?: "confirmed" | "pending" | "cancelled";
  color?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointments: Appointment[];
}

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  appointments: Appointment[];
}
