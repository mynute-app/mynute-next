export interface AppointmentHistory {
  field_changes: any | null;
}

export interface Appointment {
  id: string;
  service_id: string;
  employee_id: string;
  client_id: string;
  branch_id: string;
  company_id: string;
  payment_id: string;
  cancelled_employee_id: string;
  start_time: string;
  end_time: string;
  time_zone: string;
  rescheduled: boolean;
  cancelled: boolean;
  cancel_time: string;
  is_fulfilled: boolean;
  is_cancelled: boolean;
  is_cancelled_by_client: boolean;
  is_cancelled_by_employee: boolean;
  is_confirmed_by_client: boolean;
  history: AppointmentHistory;
  comments: string | null;
}

export interface BranchAppointmentsResponse {
  appointments: Appointment[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface BranchAppointmentsParams {
  branch_id: string;
  page?: number;
  page_size?: number;
}
