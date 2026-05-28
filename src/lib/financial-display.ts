import type { ClientQuoteStatus, FinancialTransactionStatus, FinancialTransactionType, PaymentMethod } from "@/types/financial";

const STATUS_LABELS: Record<FinancialTransactionStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const TYPE_LABELS: Record<FinancialTransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  pix: "PIX",
  credit_card: "Cartao de credito",
  debit_card: "Cartao de debito",
  bank_transfer: "Transferencia bancaria",
  other: "Outro",
};

const QUOTE_STATUS_LABELS: Record<ClientQuoteStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Rejeitado",
  expired: "Expirado",
  converted: "Convertido",
};

function toFallbackLabel(value: string): string {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getTransactionStatusLabel(status: string): string {
  return STATUS_LABELS[status as FinancialTransactionStatus] ?? toFallbackLabel(status);
}

export function getTransactionTypeLabel(type: string): string {
  return TYPE_LABELS[type as FinancialTransactionType] ?? toFallbackLabel(type);
}

export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? toFallbackLabel(method);
}

export function getQuoteStatusLabel(status: string): string {
  return QUOTE_STATUS_LABELS[status as ClientQuoteStatus] ?? toFallbackLabel(status);
}

export function getStatusBadgeVariant(status: string): "secondary" | "default" | "destructive" | "outline" {
  if (status === "pending") return "secondary";
  if (status === "paid") return "default";
  if (status === "overdue") return "destructive";
  return "outline";
}
