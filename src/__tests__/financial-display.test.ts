import {
  getPaymentMethodLabel,
  getQuoteStatusLabel,
  getStatusBadgeVariant,
  getTransactionStatusLabel,
  getTransactionTypeLabel,
} from "@/lib/financial-display";

describe("financial-display helpers", () => {
  it("maps known transaction statuses and fallback", () => {
    expect(getTransactionStatusLabel("pending")).toBe("Pendente");
    expect(getTransactionStatusLabel("paid")).toBe("Pago");
    expect(getTransactionStatusLabel("overdue")).toBe("Vencido");
    expect(getTransactionStatusLabel("cancelled")).toBe("Cancelado");
    expect(getTransactionStatusLabel("unknown")).toBe("Unknown");
  });

  it("maps transaction types and fallback", () => {
    expect(getTransactionTypeLabel("income")).toBe("Receita");
    expect(getTransactionTypeLabel("expense")).toBe("Despesa");
    expect(getTransactionTypeLabel("other")).toBe("Other");
  });

  it("maps payment methods and fallback", () => {
    expect(getPaymentMethodLabel("cash")).toBe("Dinheiro");
    expect(getPaymentMethodLabel("pix")).toBe("PIX");
    expect(getPaymentMethodLabel("credit_card")).toBe("Cartao de credito");
    expect(getPaymentMethodLabel("debit_card")).toBe("Cartao de debito");
    expect(getPaymentMethodLabel("bank_transfer")).toBe("Transferencia bancaria");
    expect(getPaymentMethodLabel("other")).toBe("Outro");
    expect(getPaymentMethodLabel("mystery")).toBe("Mystery");
  });

  it("maps quote statuses and fallback", () => {
    expect(getQuoteStatusLabel("draft")).toBe("Rascunho");
    expect(getQuoteStatusLabel("sent")).toBe("Enviado");
    expect(getQuoteStatusLabel("approved")).toBe("Aprovado");
    expect(getQuoteStatusLabel("rejected")).toBe("Rejeitado");
    expect(getQuoteStatusLabel("expired")).toBe("Expirado");
    expect(getQuoteStatusLabel("converted")).toBe("Convertido");
    expect(getQuoteStatusLabel("unknown")).toBe("Unknown");
  });

  it("maps badge variants", () => {
    expect(getStatusBadgeVariant("pending")).toBe("secondary");
    expect(getStatusBadgeVariant("paid")).toBe("default");
    expect(getStatusBadgeVariant("overdue")).toBe("destructive");
    expect(getStatusBadgeVariant("cancelled")).toBe("outline");
    expect(getStatusBadgeVariant("unknown")).toBe("outline");
  });
});
