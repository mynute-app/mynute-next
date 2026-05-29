export interface AdminAdmin {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AdminAdminListResponse {
  admins: AdminAdmin[];
  total: number;
  page: number;
  page_size: number;
}
