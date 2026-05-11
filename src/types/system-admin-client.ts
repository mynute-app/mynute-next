export interface AdminClient {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  verified: boolean;
  created_at?: string;
}

export interface AdminClientListResponse {
  clients: AdminClient[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminClientCompany {
  id: string;
  legal_name: string;
  trading_name: string;
  tax_id: string;
  sectors?: Array<{ id: string; name: string }>;
  subdomains?: Array<{ id: string; name: string }>;
}

export interface AdminClientCompaniesResponse {
  client_email: string;
  companies: AdminClientCompany[];
}

export interface AdminClientAppointmentItem {
  id: string;
  start_time: string;
  end_time: string;
  is_fulfilled: boolean;
  is_cancelled: boolean;
  is_cancelled_by_client: boolean;
  is_cancelled_by_employee: boolean;
  service_name: string;
  employee_name: string;
  employee_surname: string;
  branch_name: string;
}

export interface AdminClientAppointmentsByCompany {
  company_id: string;
  company_name: string;
  appointments: AdminClientAppointmentItem[];
}

export interface AdminClientAppointmentsResponse {
  client_id: string;
  companies: AdminClientAppointmentsByCompany[];
}
