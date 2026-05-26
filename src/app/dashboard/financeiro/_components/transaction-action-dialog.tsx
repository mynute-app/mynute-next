"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TransactionMode = "create" | "pay";
type TransactionType = "income" | "expense";
type PaymentMethod = "cash" | "pix" | "credit_card" | "debit_card" | "bank_transfer" | "other";

type CreatePayload = {
  description: string;
  amount: number;
  transaction_type: TransactionType;
  due_date: string;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDescription("");
    setAmountText("");
    setDueDate("");
    setPaymentMethod("pix");
  }, [open, mode]);

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
                <select
                  id="tx-payment-method"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartao de credito</option>
                  <option value="debit_card">Cartao de debito</option>
                  <option value="bank_transfer">Transferencia bancaria</option>
                  <option value="other">Outro</option>
                </select>
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
