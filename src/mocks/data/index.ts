/**
 * Central mock data for all tests and dev-preview pages.
 * Uses realistic Portuguese-language data matching the Mynute domain.
 */

import type { Company, Branch, Service, Employee } from "../../../types/company";
import type {
  Appointment,
  BranchAppointmentsResponse,
  ClientInfo,
  ServiceInfo,
  EmployeeInfo,
} from "../../../types/appointment";

// ─── IDs (stable, reused across mock data) ────────────────────────────────────

export const MOCK_IDS = {
  company: "comp-preview-001",
  branch1: "branch-preview-001",
  branch2: "branch-preview-002",
  employee1: "emp-preview-001",
  employee2: "emp-preview-002",
  service1: "svc-preview-001",
  service2: "svc-preview-002",
  service3: "svc-preview-003",
  client1: "client-preview-001",
  client2: "client-preview-002",
  appointment1: "appt-preview-001",
  appointment2: "appt-preview-002",
  appointment3: "appt-preview-003",
};

// ─── Company ──────────────────────────────────────────────────────────────────

export const mockCompany: Company = {
  id: MOCK_IDS.company,
  legal_name: "Salão Beleza Total Ltda",
  trading_name: "Beleza Total",
  name: "Beleza Total",
  tax_id: "12.345.678/0001-90",
  branches: [],
  services: [],
  employees: [],
  sectors: [],
  subdomains: [{ id: "sub-001", subdomain: "beleza-total" }],
  design: {
    colors: {
      primary: "#7c3aed",
      secondary: "#a78bfa",
      tertiary: "#ede9fe",
      quaternary: "#4c1d95",
    },
    images: {
      logo: {
        url: "https://placehold.co/200x80/7c3aed/ffffff?text=Beleza+Total",
        alt: "Logo Beleza Total",
        title: "Logo",
        caption: "",
      },
      banner: {
        url: "https://placehold.co/1200x400/4c1d95/ffffff?text=Banner",
        alt: "Banner Beleza Total",
        title: "Banner",
        caption: "",
      },
      background: {
        url: "https://placehold.co/1920x1080/ede9fe/7c3aed?text=Background",
        alt: "Background",
        title: "Background",
        caption: "",
      },
    },
  },
};

// ─── Branches ─────────────────────────────────────────────────────────────────

export const mockBranch1: Branch = {
  id: MOCK_IDS.branch1,
  company_id: MOCK_IDS.company,
  name: "Filial Centro",
  street: "Rua das Flores",
  number: "123",
  complement: "Sala 4",
  neighborhood: "Centro",
  zip_code: "01310-000",
  city: "São Paulo",
  state: "SP",
  country: "BR",
  time_zone: "America/Sao_Paulo",
  is_active: true,
  active: true,
  services_count: 3,
  employees_count: 2,
  work_schedule_summary: "Seg-Sex 09:00-18:00",
};

export const mockBranch2: Branch = {
  id: MOCK_IDS.branch2,
  company_id: MOCK_IDS.company,
  name: "Filial Jardins",
  street: "Alameda Santos",
  number: "456",
  complement: "",
  neighborhood: "Jardins",
  zip_code: "01419-001",
  city: "São Paulo",
  state: "SP",
  country: "BR",
  time_zone: "America/Sao_Paulo",
  is_active: true,
  active: true,
  services_count: 2,
  employees_count: 1,
  work_schedule_summary: "Seg-Sáb 08:00-20:00",
};

export const mockBranches: Branch[] = [mockBranch1, mockBranch2];

export const mockBranchListResponse = {
  branches: mockBranches,
  total: 2,
  page: 1,
  page_size: 20,
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const mockService1: Service = {
  id: MOCK_IDS.service1,
  name: "Corte de Cabelo",
  duration: 60,
  buffer: "15",
  price: 8500,
  description: "Corte clássico masculino ou feminino",
  category: "Cabelo",
  is_active: true,
};

export const mockService2: Service = {
  id: MOCK_IDS.service2,
  name: "Coloração",
  duration: 120,
  buffer: "30",
  price: 25000,
  description: "Coloração completa com produtos de alta qualidade",
  category: "Cabelo",
  is_active: true,
};

export const mockService3: Service = {
  id: MOCK_IDS.service3,
  name: "Manicure",
  duration: 45,
  buffer: "10",
  price: 5000,
  description: "Manicure completa com esmaltação",
  category: "Unhas",
  is_active: false,
};

export const mockServices: Service[] = [mockService1, mockService2, mockService3];

export const mockServiceListResponse = {
  services: mockServices,
  total: 3,
  page: 1,
  page_size: 20,
};

// ─── Employees ────────────────────────────────────────────────────────────────

export const mockEmployee1: Employee = {
  id: 1,
  name: "Ana",
  surname: "Silva",
  email: "ana.silva@belezatotal.com",
  phone: "(11) 98765-4321",
  permission: "employee",
  role: "Cabeleireira",
  branches: [mockBranch1],
  services: [mockService1, mockService2],
  work_schedule: [],
};

export const mockEmployee2: Employee = {
  id: 2,
  name: "Carlos",
  surname: "Mendes",
  email: "carlos.mendes@belezatotal.com",
  phone: "(11) 91234-5678",
  permission: "owner",
  role: "Manicure",
  branches: [mockBranch1, mockBranch2],
  services: [mockService3],
  work_schedule: [],
};

export const mockEmployees: Employee[] = [mockEmployee1, mockEmployee2];

export const mockEmployeeListResponse = {
  employees: mockEmployees,
  total: 2,
  page: 1,
  page_size: 20,
};

// ─── Appointments ─────────────────────────────────────────────────────────────

const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(now);
dayAfter.setDate(dayAfter.getDate() + 2);

export const mockClientInfo: ClientInfo[] = [
  {
    id: MOCK_IDS.client1,
    name: "Maria",
    surname: "Oliveira",
    email: "maria.oliveira@email.com",
    phone: "(11) 99887-6655",
  },
  {
    id: MOCK_IDS.client2,
    name: "João",
    surname: "Santos",
    email: "joao.santos@email.com",
    phone: "(11) 98877-5544",
  },
];

export const mockServiceInfo: ServiceInfo[] = [
  {
    id: MOCK_IDS.service1,
    name: "Corte de Cabelo",
    description: "Corte clássico",
    price: 8500,
    duration: 60,
  },
  {
    id: MOCK_IDS.service2,
    name: "Coloração",
    description: "Coloração completa",
    price: 25000,
    duration: 120,
  },
];

export const mockEmployeeInfo: EmployeeInfo[] = [
  {
    id: MOCK_IDS.employee1,
    name: "Ana",
    surname: "Silva",
    email: "ana.silva@belezatotal.com",
  },
  {
    id: MOCK_IDS.employee2,
    name: "Carlos",
    surname: "Mendes",
    email: "carlos.mendes@belezatotal.com",
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: MOCK_IDS.appointment1,
    service_id: MOCK_IDS.service1,
    employee_id: MOCK_IDS.employee1,
    client_id: MOCK_IDS.client1,
    branch_id: MOCK_IDS.branch1,
    company_id: MOCK_IDS.company,
    payment_id: "",
    cancelled_employee_id: "",
    start_time: `${tomorrow.toISOString().slice(0, 10)} 10:00:00`,
    end_time: `${tomorrow.toISOString().slice(0, 10)} 11:00:00`,
    time_zone: "America/Sao_Paulo",
    rescheduled: false,
    cancelled: false,
    cancel_time: "",
    is_fulfilled: false,
    is_cancelled: false,
    is_cancelled_by_client: false,
    is_cancelled_by_employee: false,
    is_confirmed_by_client: true,
    is_approved_by_employee: true,
    history: { field_changes: null },
    comments: null,
  },
  {
    id: MOCK_IDS.appointment2,
    service_id: MOCK_IDS.service2,
    employee_id: MOCK_IDS.employee1,
    client_id: MOCK_IDS.client2,
    branch_id: MOCK_IDS.branch1,
    company_id: MOCK_IDS.company,
    payment_id: "",
    cancelled_employee_id: "",
    start_time: `${dayAfter.toISOString().slice(0, 10)} 14:00:00`,
    end_time: `${dayAfter.toISOString().slice(0, 10)} 16:00:00`,
    time_zone: "America/Sao_Paulo",
    rescheduled: false,
    cancelled: false,
    cancel_time: "",
    is_fulfilled: false,
    is_cancelled: false,
    is_cancelled_by_client: false,
    is_cancelled_by_employee: false,
    is_confirmed_by_client: false,
    is_approved_by_employee: false,
    history: { field_changes: null },
    comments: "Cliente pediu produto especial",
  },
  {
    id: MOCK_IDS.appointment3,
    service_id: MOCK_IDS.service3,
    employee_id: MOCK_IDS.employee2,
    client_id: MOCK_IDS.client1,
    branch_id: MOCK_IDS.branch2,
    company_id: MOCK_IDS.company,
    payment_id: "",
    cancelled_employee_id: MOCK_IDS.employee2,
    start_time: `${now.toISOString().slice(0, 10)} 09:00:00`,
    end_time: `${now.toISOString().slice(0, 10)} 09:45:00`,
    time_zone: "America/Sao_Paulo",
    rescheduled: false,
    cancelled: true,
    cancel_time: now.toISOString(),
    is_fulfilled: false,
    is_cancelled: true,
    is_cancelled_by_client: false,
    is_cancelled_by_employee: true,
    is_confirmed_by_client: true,
    is_approved_by_employee: true,
    history: { field_changes: null },
    comments: null,
  },
];

export const mockBranchAppointmentsResponse: BranchAppointmentsResponse = {
  appointments: mockAppointments,
  client_info: mockClientInfo,
  service_info: mockServiceInfo,
  employee_info: mockEmployeeInfo,
  total_count: 3,
  page: 1,
  page_size: 10,
};

// ─── Inventory ────────────────────────────────────────────────────────────────

import type {
  ServiceInventoryItem,
  AppointmentInventoryUsage,
  FinalizeAppointmentResponse,
} from "../../../types/inventory";

export const MOCK_INVENTORY_IDS = {
  product1: "prod-inv-001",
  product2: "prod-inv-002",
  unit1: "unit-inv-001",
  usage1: "usage-inv-001",
  usage2: "usage-inv-002",
  serviceItem1: "svc-item-001",
  serviceItem2: "svc-item-002",
};

export const mockServiceInventoryItems: ServiceInventoryItem[] = [
  {
    id: MOCK_INVENTORY_IDS.serviceItem1,
    service_id: MOCK_IDS.service1,
    product_id: MOCK_INVENTORY_IDS.product1,
    product_name: "Shampoo Profissional 500ml",
    unit_id: MOCK_INVENTORY_IDS.unit1,
    unit_symbol: "ml",
    unit_cost_cents: 1500,
    default_quantity: 50,
    is_required: true,
    notes: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: MOCK_INVENTORY_IDS.serviceItem2,
    service_id: MOCK_IDS.service1,
    product_id: MOCK_INVENTORY_IDS.product2,
    product_name: "Condicionador Hidratante 300ml",
    unit_id: MOCK_INVENTORY_IDS.unit1,
    unit_symbol: "ml",
    unit_cost_cents: 2000,
    default_quantity: 30,
    is_required: false,
    notes: "Usar conforme necessidade",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

export const mockServiceInventoryItemsResponse = {
  items: mockServiceInventoryItems,
  total: 2,
};

export const mockAppointmentInventoryUsages: AppointmentInventoryUsage[] = [
  {
    id: MOCK_INVENTORY_IDS.usage1,
    appointment_id: MOCK_IDS.appointment1,
    service_inventory_item_id: MOCK_INVENTORY_IDS.serviceItem1,
    product_id: MOCK_INVENTORY_IDS.product1,
    product_name: "Shampoo Profissional 500ml",
    location_id: "loc-001",
    batch_id: "batch-abc-001",
    serial_id: null,
    movement_id: null,
    planned_quantity: 50,
    actual_quantity: null,
    unit_id: MOCK_INVENTORY_IDS.unit1,
    unit_symbol: "ml",
    unit_cost: 1500,
    total_cost: 75000,
    source: "service_default",
    status: "reserved",
    notes: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: MOCK_INVENTORY_IDS.usage2,
    appointment_id: MOCK_IDS.appointment1,
    service_inventory_item_id: MOCK_INVENTORY_IDS.serviceItem2,
    product_id: MOCK_INVENTORY_IDS.product2,
    product_name: "Condicionador Hidratante 300ml",
    location_id: "loc-001",
    batch_id: null,
    serial_id: null,
    movement_id: null,
    planned_quantity: 30,
    actual_quantity: null,
    unit_id: MOCK_INVENTORY_IDS.unit1,
    unit_symbol: "ml",
    unit_cost: 2000,
    total_cost: 60000,
    source: "service_default",
    status: "planned",
    notes: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

export const mockAppointmentInventoryUsagesResponse = {
  items: mockAppointmentInventoryUsages,
};

export const mockFinalizeResponse: FinalizeAppointmentResponse = {
  appointment_id: MOCK_IDS.appointment1,
  is_fulfilled: true,
  items: [
    {
      ...mockAppointmentInventoryUsages[0],
      actual_quantity: 50,
      status: "consumed",
    },
    {
      ...mockAppointmentInventoryUsages[1],
      actual_quantity: 30,
      status: "consumed",
    },
  ],
};

// ─── Company Clients ──────────────────────────────────────────────────────────

export const mockCompanyClients = [
  {
    id: MOCK_IDS.client1,
    name: "Maria",
    surname: "Oliveira",
    email: "maria.oliveira@email.com",
    phone: "(11) 99887-6655",
    created_at: "2025-01-15T10:00:00Z",
    total_appointments: 8,
    last_appointment: "2026-04-20T14:00:00Z",
  },
  {
    id: MOCK_IDS.client2,
    name: "João",
    surname: "Santos",
    email: "joao.santos@email.com",
    phone: "(11) 98877-5544",
    created_at: "2025-03-10T10:00:00Z",
    total_appointments: 3,
    last_appointment: "2026-03-15T10:00:00Z",
  },
];

export const mockCompanyClientsResponse = {
  clients: mockCompanyClients,
  total: 2,
  page: 1,
  page_size: 20,
};

// ─── Blocked Dates ────────────────────────────────────────────────────────────

export const mockBlockedDates = [
  {
    id: "blocked-001",
    start_date: "2026-06-10",
    end_date: "2026-06-12",
    reason: "Feriado nacional",
    type: "company",
  },
  {
    id: "blocked-002",
    start_date: "2026-07-01",
    end_date: "2026-07-01",
    reason: "Manutenção",
    type: "branch",
  },
];

// ─── User / Employee Profile ───────────────────────────────────────────────────

export const mockUser = {
  id: MOCK_IDS.employee1,
  name: "Ana",
  surname: "Silva",
  email: "ana.silva@belezatotal.com",
  phone: "(11) 98765-4321",
  permission: "owner",
  role: "Proprietária",
};
