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
  is_active: true,
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
  is_active: true,
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
} from "@/types/inventory";

export const MOCK_INVENTORY_IDS = {
  product1: "prod-inv-001",
  product2: "prod-inv-002",
  unit1: "unit-inv-001",
  usage1: "usage-inv-001",
  usage2: "usage-inv-002",
  usage3: "usage-inv-003",
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
    batch_id: null,
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
    track_batch: false,
    track_serial: false,
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
    track_batch: false,
    track_serial: false,
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

// Usage where the product requires batch tracking (track_batch=true)
export const mockUsageWithTrackBatch: AppointmentInventoryUsage = {
  id: MOCK_INVENTORY_IDS.usage3,
  appointment_id: MOCK_IDS.appointment1,
  service_inventory_item_id: null,
  product_id: MOCK_INVENTORY_IDS.product1,
  product_name: "Produto com Lote",
  location_id: "loc-001",
  batch_id: null,
  serial_id: null,
  movement_id: null,
  planned_quantity: 10,
  actual_quantity: null,
  unit_id: MOCK_INVENTORY_IDS.unit1,
  unit_symbol: "un",
  unit_cost: 500,
  total_cost: 5000,
  source: "service_default",
  status: "reserved",
  notes: "",
  track_batch: true,
  track_serial: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
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

// ─── Financial Mock IDs ───────────────────────────────────────────────────────

export const MOCK_FINANCIAL_IDS = {
  account1: "fin-acc-001",
  account2: "fin-acc-002",
  category1: "fin-cat-001",
  category2: "fin-cat-002",
  transaction1: "fin-txn-001",
  transaction2: "fin-txn-002",
  transaction3: "fin-txn-003",
  budget1: "fin-bgt-001",
  quote1: "fin-qte-001",
  quote2: "fin-qte-002",
};

// ─── Financial Accounts ───────────────────────────────────────────────────────

export const mockFinancialAccounts = [
  {
    id: MOCK_FINANCIAL_IDS.account1,
    name: "Caixa Principal",
    account_type: "cash",
    balance: 5000.0,
    branch_id: null,
    description: "Caixa físico do salão",
    is_active: true,
    created_at: 1716000000,
  },
  {
    id: MOCK_FINANCIAL_IDS.account2,
    name: "Conta Corrente Itaú",
    account_type: "bank",
    balance: 12500.5,
    branch_id: null,
    description: "Conta bancária principal",
    is_active: true,
    created_at: 1716000001,
  },
];

export const mockFinancialAccountsResponse = {
  accounts: mockFinancialAccounts,
  total: mockFinancialAccounts.length,
};

// ─── Financial Categories ─────────────────────────────────────────────────────

export const mockFinancialCategories = [
  {
    id: MOCK_FINANCIAL_IDS.category1,
    name: "Serviços de Beleza",
    category_type: "income",
    color: "#22c55e",
    icon: "scissors",
    description: "Receitas de serviços prestados",
    is_active: true,
    branch_id: null,
    created_at: 1716000010,
  },
  {
    id: MOCK_FINANCIAL_IDS.category2,
    name: "Material de Consumo",
    category_type: "expense",
    color: "#ef4444",
    icon: "shopping-bag",
    description: "Compras de insumos e materiais",
    is_active: true,
    branch_id: null,
    created_at: 1716000011,
  },
];

export const mockFinancialCategoriesResponse = {
  categories: mockFinancialCategories,
  total: mockFinancialCategories.length,
};

// ─── Financial Transactions ───────────────────────────────────────────────────

export const mockFinancialTransactions = [
  {
    id: MOCK_FINANCIAL_IDS.transaction1,
    description: "Pagamento — Corte + Escova",
    amount: 150.0,
    charged_amount: 150.0,
    transaction_type: "income",
    status: "paid",
    payment_method: "pix",
    due_date: "2026-05-20",
    payment_date: "2026-05-20",
    branch_id: MOCK_IDS.branch1,
    account_id: MOCK_FINANCIAL_IDS.account1,
    category_id: MOCK_FINANCIAL_IDS.category1,
    reference_type: "appointment",
    reference_id: MOCK_IDS.appointment1,
    notes: "",
    created_at: 1716100000,
  },
  {
    id: MOCK_FINANCIAL_IDS.transaction2,
    description: "Compra de Tintura",
    amount: 320.0,
    charged_amount: null,
    transaction_type: "expense",
    status: "pending",
    payment_method: "",
    due_date: "2026-05-28",
    payment_date: null,
    branch_id: null,
    account_id: null,
    category_id: MOCK_FINANCIAL_IDS.category2,
    reference_type: "manual",
    reference_id: null,
    notes: "Compra mensal de insumos",
    created_at: 1716100100,
  },
  {
    id: MOCK_FINANCIAL_IDS.transaction3,
    description: "Assinatura Software de Gestão",
    amount: 89.9,
    charged_amount: null,
    transaction_type: "expense",
    status: "overdue",
    payment_method: "",
    due_date: "2026-05-15",
    payment_date: null,
    branch_id: null,
    account_id: null,
    category_id: null,
    reference_type: "manual",
    reference_id: null,
    notes: "",
    created_at: 1716100200,
  },
];

export const mockFinancialTransactionsResponse = {
  transactions: mockFinancialTransactions,
  total: mockFinancialTransactions.length,
};

// ─── Financial Cash Flow Report ───────────────────────────────────────────────

export const mockCashFlowReport = {
  start_date: "2026-05-01",
  end_date: "2026-05-31",
  total_income: 1850.0,
  total_expense: 409.9,
  net_balance: 1440.1,
  entries: [
    { date: "2026-05-01", income: 300.0, expense: 0, net_balance: 300.0, running_balance: 300.0 },
    { date: "2026-05-15", income: 0, expense: 89.9, net_balance: -89.9, running_balance: 210.1 },
    { date: "2026-05-20", income: 1550.0, expense: 320.0, net_balance: 1230.0, running_balance: 1440.1 },
  ],
};

// ─── Financial Summary ────────────────────────────────────────────────────────

export const mockFinancialSummary = {
  monthly_income: 1850.0,
  monthly_expense: 409.9,
  net_balance: 1440.1,
  pending_receivables: 500.0,
};

// ─── Financial DRE Report ─────────────────────────────────────────────────────

export const mockDREReport = {
  start_date: "2026-05-01",
  end_date: "2026-05-31",
  total_income: 185000,
  total_expense: 40990,
  gross_profit: 144010,
  income_by_category: [
    { category_id: MOCK_FINANCIAL_IDS.category1, category_name: "Serviços de Beleza", amount: 185000 },
  ],
  expense_by_category: [
    { category_id: MOCK_FINANCIAL_IDS.category2, category_name: "Material de Consumo", amount: 40990 },
  ],
};

// ─── Financial Receivables/Payables Reports ───────────────────────────────────

export const mockReceivablesReport = {
  total: 500.0,
  items: [mockFinancialTransactions[0]],
};

export const mockPayablesReport = {
  total: 409.9,
  items: [mockFinancialTransactions[1], mockFinancialTransactions[2]],
};

export const mockAppointmentsRevenueReport = {
  total_revenue: 1850.0,
  appointment_count: 12,
  entries: [
    { date: "2026-05-20", revenue: 150.0, count: 1 },
  ],
};

// ─── Financial Budgets ────────────────────────────────────────────────────────

export const mockFinancialBudgets = [
  {
    id: MOCK_FINANCIAL_IDS.budget1,
    name: "Orçamento Maio 2026",
    category_id: null,
    amount: 2000.0,
    realized: 409.9,
    period_start: "2026-05-01",
    period_end: "2026-05-31",
    branch_id: null,
    notes: "",
    created_at: 1716000020,
  },
];

export const mockFinancialBudgetsResponse = {
  budgets: mockFinancialBudgets,
  total: mockFinancialBudgets.length,
};

// ─── Client Quotes ────────────────────────────────────────────────────────────

export const mockClientQuotes = [
  {
    id: MOCK_FINANCIAL_IDS.quote1,
    client_name: "Mariana Costa",
    client_email: "mariana@email.com",
    client_phone: "(11) 97654-3210",
    status: "sent",
    total_amount: 450.0,
    valid_until: "2026-06-01",
    notes: "Pacote completo",
    branch_id: null,
    items: [
      {
        id: "qitem-001",
        quote_id: MOCK_FINANCIAL_IDS.quote1,
        description: "Coloração completa",
        quantity: 1,
        unit_price: 300.0,
        total_price: 300.0,
      },
      {
        id: "qitem-002",
        quote_id: MOCK_FINANCIAL_IDS.quote1,
        description: "Corte feminino",
        quantity: 1,
        unit_price: 150.0,
        total_price: 150.0,
      },
    ],
    created_at: 1716200000,
  },
  {
    id: MOCK_FINANCIAL_IDS.quote2,
    client_name: "Fernanda Lima",
    client_email: "fernanda@email.com",
    client_phone: "(11) 96543-2109",
    status: "draft",
    total_amount: 120.0,
    valid_until: null,
    notes: "",
    branch_id: null,
    items: [
      {
        id: "qitem-003",
        quote_id: MOCK_FINANCIAL_IDS.quote2,
        description: "Hidratação",
        quantity: 1,
        unit_price: 120.0,
        total_price: 120.0,
      },
    ],
    created_at: 1716200100,
  },
];

export const mockClientQuotesResponse = {
  quotes: mockClientQuotes,
  total: mockClientQuotes.length,
};

// ─── Client Appointments (for client-facing /client/agendamentos page) ────────

const futureDate1 = new Date();
futureDate1.setDate(futureDate1.getDate() + 3);
const futureDate2 = new Date();
futureDate2.setDate(futureDate2.getDate() + 10);
const pastDate1 = new Date();
pastDate1.setDate(pastDate1.getDate() - 7);

export const mockClientAppointments = [
  {
    id: "apt-client-001",
    company_id: "company-preview-001",
    company_name: "Salão Beleza Total",
    company_slug: "beleza-total",
    branch_id: MOCK_IDS.branch1,
    branch_name: "Unidade Centro",
    service_id: MOCK_IDS.service1,
    service_name: "Corte de Cabelo",
    service_price: 8500,
    employee_id: MOCK_IDS.employee1,
    employee_name: "Ana",
    employee_surname: "Silva",
    start_time: futureDate1.toISOString(),
    end_time: new Date(futureDate1.getTime() + 60 * 60 * 1000).toISOString(),
    time_zone: "America/Sao_Paulo",
    is_cancelled: false,
    is_fulfilled: false,
    is_cancelled_by_client: false,
    is_approved_by_employee: true,
  },
  {
    id: "apt-client-002",
    company_id: "company-preview-001",
    company_name: "Salão Beleza Total",
    company_slug: "beleza-total",
    branch_id: MOCK_IDS.branch1,
    branch_name: "Unidade Centro",
    service_id: MOCK_IDS.service2,
    service_name: "Coloração Completa",
    service_price: 25000,
    employee_id: MOCK_IDS.employee2,
    employee_name: "Carlos",
    employee_surname: "Mendes",
    start_time: new Date(futureDate2.getTime()).toISOString(),
    end_time: new Date(futureDate2.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    time_zone: "America/Sao_Paulo",
    is_cancelled: false,
    is_fulfilled: false,
    is_cancelled_by_client: false,
    is_approved_by_employee: false,
  },
  {
    id: "apt-client-003",
    company_id: "company-preview-001",
    company_name: "Salão Beleza Total",
    company_slug: "beleza-total",
    branch_id: MOCK_IDS.branch1,
    branch_name: "Unidade Centro",
    service_id: MOCK_IDS.service3,
    service_name: "Manicure",
    service_price: 5000,
    employee_id: MOCK_IDS.employee1,
    employee_name: "Ana",
    employee_surname: "Silva",
    start_time: pastDate1.toISOString(),
    end_time: new Date(pastDate1.getTime() + 45 * 60 * 1000).toISOString(),
    time_zone: "America/Sao_Paulo",
    is_cancelled: true,
    is_fulfilled: false,
    is_cancelled_by_client: true,
    is_approved_by_employee: true,
  },
];
