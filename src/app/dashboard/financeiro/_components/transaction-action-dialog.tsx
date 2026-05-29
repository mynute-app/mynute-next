"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanyClients } from "@/hooks/use-company-clients";
import { useCompanySuppliers } from "@/hooks/use-company-suppliers";

type TransactionMode = "create" | "pay";
type TransactionType = "income" | "expense";
type PaymentMethod = "cash" | "pix" | "credit_card" | "debit_card" | "bank_transfer" | "other";
type ContactType = "none" | "client" | "supplier";

type CreatePayload = {
  description: string;
  amount: number;
  transaction_type: TransactionType;
  due_date: string;
  client_id?: string;
  supplier_id?: string;
};

type PayPayload = {
  charged_amount: number;
  payment_method: PaymentMethod;
};

interface BaseDialogProps {
  open: boolean;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
}

type CreateDialogProps = BaseDialogProps & {
  mode: "create";
  defaultTransactionType?: TransactionType;
  onSubmit: (payload: CreatePayload) => void | Promise<void>;
};

type PayDialogProps = BaseDialogProps & {
  mode: "pay";
  defaultTransactionType?: never;
  onSubmit: (payload: PayPayload) => void | Promise<void>;
};

type TransactionActionDialogProps = CreateDialogProps | PayDialogProps;

export function TransactionActionDialog({
  open,
  mode,
  defaultTransactionType,
  isLoading = false,
  onOpenChange,
  onSubmit,
}: TransactionActionDialogProps) {
  const [description, setDescription] = useState("");
  const [amountText, setAmountText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [contactType, setContactType] = useState<ContactType>("none");
  const [contactId, setContactId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Carregar clientes e fornecedores para o combobox (somente quando criar)
  const { data: clientsData } = useCompanyClients({
    page: 1,
    pageSize: 200,
    enabled: open && mode === "create" && contactType === "client",
  });
  const { data: suppliersData } = useCompanySuppliers({
    page: 1,
    pageSize: 200,
    enabled: open && mode === "create" && contactType === "supplier",
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDescription("");
    setAmountText("");
    setDueDate("");
    setPaymentMethod("pix");
    setContactType("none");
    setContactId("");
  }, [open, mode]);

  // Ao trocar tipo de contato, limpa a seleção
  useEffect(() => {
    setContactId("");
  }, [contactType]);

  const title = useMemo(() => {
    if (mode === "pay") return "Registrar pagamento";
    return (defaultTransactionType ?? "income") === "income" ? "Nova receita" : "Nova despesa";
  }, [defaultTransactionType, mode]);

  const handleSubmit = async () => {
    const amount = Math.round(Number(amountText || "0") * 100);

    if (mode === "create") {
      if (!description.trim() || amount <= 0) {
        setError("Informe descricao e valor valido.");
        return;
      }

      const payload: CreatePayload = {
        description: description.trim(),
        amount,
        transaction_type: defaultTransactionType ?? "income",
        due_date: dueDate || "",
      };

      if (contactType === "client" && contactId) {
        payload.client_id = contactId;
      } else if (contactType === "supplier" && contactId) {
        payload.supplier_id = contactId;
      }

      setError(null);
      await onSubmit(payload);
      return;
    }

    if (amount <= 0 || !paymentMethod) {
      setError("Informe valor cobrado e forma de pagamento.");
      return;
    }

    const payload: PayPayload = {
      charged_amount: amount,
      payment_method: paymentMethod,
    };

    setError(null);
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Preencha os dados do lancamento financeiro."
              : "Informe os dados para concluir o pagamento."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "create" ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="tx-description">Descricao</Label>
                <Input
                  id="tx-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tx-amount">Valor</Label>
                <Input
                  id="tx-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountText}
                  onChange={(event) => setAmountText(event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tx-due-date">Vencimento</Label>
                <Input
                  id="tx-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>

              {/* Vincular a cliente ou fornecedor */}
              <div className="space-y-1">
                <Label htmlFor="tx-contact-type">Vincular a</Label>
                <Select value={contactType} onValueChange={(v) => setContactType(v as ContactType)}>
                  <SelectTrigger id="tx-contact-type">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="supplier">Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {contactType === "client" && (
                <div className="space-y-1">
                  <Label htmlFor="tx-client-id">Cliente</Label>
                  <Select value={contactId} onValueChange={setContactId}>
                    <SelectTrigger id="tx-client-id">
                      <SelectValue placeholder="Selecione um cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsData?.company_clients?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} {c.surname || ""} — {c.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {contactType === "supplier" && (
                <div className="space-y-1">
                  <Label htmlFor="tx-supplier-id">Fornecedor</Label>
                  <Select value={contactId} onValueChange={setContactId}>
                    <SelectTrigger id="tx-supplier-id">
                      <SelectValue placeholder="Selecione um fornecedor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliersData?.company_suppliers?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} {s.surname || ""} — {s.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="tx-charged-amount">Valor cobrado</Label>
                <Input
                  id="tx-charged-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountText}
                  onChange={(event) => setAmountText(event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tx-payment-method">Forma de pagamento</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger id="tx-payment-method">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="credit_card">Cartao de credito</SelectItem>
                    <SelectItem value="debit_card">Cartao de debito</SelectItem>
                    <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {mode === "pay" ? "Confirmar pagamento" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
