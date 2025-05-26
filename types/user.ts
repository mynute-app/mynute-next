export interface WorkSchedule {
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
  sunday: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  company_id: string;
  is_system_role: boolean;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  tags: string[] | null;
  verified: boolean;
  work_schedule: WorkSchedule;
  appointments: any[];
  company_id: string;
  branches: any[]; 
  services: any[]; 
  roles: Role[];
}
