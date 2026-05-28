export type FinancialAccountType = "cash" | "bank" | "credit_card" | "other";
export type FinancialCategoryType = "income" | "expense";
export type FinancialTransactionType = "income" | "expense";
export type FinancialTransactionStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled";
export type PaymentMethod =
  | "cash"
  | "pix"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "other";
export type ClientQuoteStatus =
  | "draft"
  | "sent"
  | "approved"
  | "rejected"
  | "expired"
  | "converted";

export interface FinancialAccount {
  id: string;
  name: string;
  account_type: FinancialAccountType;
  balance: number;
  branch_id: string | null;
  description: string;
  is_active: boolean;
  created_at: number;
}

export interface FinancialCategory {
  id: string;
  name: string;
  category_type: FinancialCategoryType;
  color: string;
  icon: string;
  description: string;
  is_active: boolean;
  branch_id: string | null;
  created_at: number;
}

export interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  charged_amount: number | null;
  transaction_type: FinancialTransactionType;
  status: FinancialTransactionStatus;
  payment_method: string;
  due_date: string | null;
  payment_date: string | null;
  branch_id: string | null;
  account_id: string | null;
  category_id: string | null;
  reference_type: string;
  reference_id: string | null;
  notes: string;
  created_at: number;
}

export interface FinancialBudget {
  id: string;
  name: string;
  category_id: string | null;
  amount: number;
  realized: number;
  period_start: string;
  period_end: string;
  branch_id: string | null;
  notes: string;
  created_at: number;
}

export interface ClientQuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ClientQuote {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: ClientQuoteStatus;
  total_amount: number;
  valid_until: string | null;
  notes: string;
  branch_id: string | null;
  items: ClientQuoteItem[];
  created_at: number;
}

export interface CashFlowEntry {
  date: string;
  income: number;
  expense: number;
  net_balance: number;
  running_balance: number;
}

export interface CashFlowReport {
  start_date: string;
  end_date: string;
  total_income: number;
  total_expense: number;
  net_balance: number;
  entries: CashFlowEntry[];
}

export interface DRECategoryLine {
  category_id: string | null;
  category_name: string;
  amount: number;
}

export interface DREReport {
  start_date: string;
  end_date: string;
  total_income: number;
  total_expense: number;
  gross_profit: number;
  income_by_category: DRECategoryLine[];
  expense_by_category: DRECategoryLine[];
}

export interface ReceivablesReport {
  total_pending: number;
  total_overdue: number;
  transactions: FinancialTransaction[];
}

export interface PayablesReport {
  total_pending: number;
  total_overdue: number;
  transactions: FinancialTransaction[];
}

export interface AppointmentRevenueEntry {
  appointment_id: string;
  service_name: string;
  amount: number;
  charged_amount: number | null;
  payment_method: string;
  payment_date: string | null;
}

export interface AppointmentsRevenueReport {
  start_date: string;
  end_date: string;
  total_revenue: number;
  count: number;
  entries: AppointmentRevenueEntry[];
}

export interface CreateFinancialAccountPayload {
  name: string;
  account_type: FinancialAccountType;
  branch_id?: string | null;
  description?: string;
}

export interface CreateFinancialCategoryPayload {
  name: string;
  category_type: FinancialCategoryType;
  color?: string;
  icon?: string;
  description?: string;
  branch_id?: string | null;
}

export interface CreateFinancialTransactionPayload {
  description: string;
  amount: number;
  transaction_type: FinancialTransactionType;
  due_date?: string;
  branch_id?: string | null;
  account_id?: string | null;
  category_id?: string | null;
  notes?: string;
}

export interface PayFinancialTransactionPayload {
  charged_amount?: number;
  payment_method?: PaymentMethod;
  account_id?: string | null;
  payment_date?: string;
}

export interface CreateFinancialBudgetPayload {
  name: string;
  category_id?: string | null;
  amount: number;
  period_start: string;
  period_end: string;
  branch_id?: string | null;
  notes?: string;
}

export interface CreateClientQuoteItemPayload {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface CreateClientQuotePayload {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  valid_until?: string;
  notes?: string;
  branch_id?: string | null;
  items: CreateClientQuoteItemPayload[];
}
