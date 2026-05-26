"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useCreateFinancialTransaction,
  useFinancialTransactions,
  usePayFinancialTransaction,
} from "@/hooks/financial/use-financial-transactions";
import { DateRangeFilter } from "@/app/dashboard/financeiro/_components/date-range-filter";
import { TransactionActionDialog } from "@/app/dashboard/financeiro/_components/transaction-action-dialog";
import { getStatusBadgeVariant, getTransactionStatusLabel } from "@/lib/financial-display";
import { formatFinancialCurrency, normalizeDateStr } from "@/lib/financial-utils";
import type { PaymentMethod } from "@/types/financial";

export default function ContasAPagarPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useFinancialTransactions({ type: "expense", page_size: 200 });
  const createTransaction = useCreateFinancialTransaction();
  const payTransaction = usePayFinancialTransaction();

  const filteredData = useMemo(() => {
    return (data ?? []).filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      if (search.trim()) {
        const query = search.trim().toLowerCase();
        if (!item.description.toLowerCase().includes(query)) return false;
      }

      if (startDate && item.due_date && normalizeDateStr(item.due_date) < startDate) return false;
      if (endDate && item.due_date && normalizeDateStr(item.due_date) > endDate) return false;

      return true;
    });
  }, [data, endDate, search, startDate, statusFilter]);

  const handleCreateSubmit = async (payload: {
    description: string;
    amount: number;
    transaction_type: "income" | "expense";
    due_date: string;
  }) => {
    await createTransaction.mutate(payload);
    setCreateOpen(false);
    await refetch();
  };

  const handlePaySubmit = async (payload: { charged_amount: number; payment_method: PaymentMethod }) => {
    if (!selectedTransactionId) return;
    await payTransaction.mutate(selectedTransactionId, payload);
    setPayOpen(false);
    setSelectedTransactionId(null);
    await refetch();
  };

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Contas a Pagar</h1>
              <p className="text-sm text-muted-foreground">Gerencie despesas pendentes e pagamentos realizados.</p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>Nova Despesa</Button>
          </div>

          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onApply={(nextStartDate, nextEndDate) => {
              setStartDate(nextStartDate);
              setEndDate(nextEndDate);
            }}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Buscar por descricao"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center justify-between gap-3">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={refetch}>Tentar novamente</Button>
              </div>
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem lançamentos.</TableCell></TableRow>
              ) : (
                filteredData.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>{getTransactionStatusLabel(item.status)}</Badge>
                    </TableCell>
                    <TableCell>{item.due_date ? new Date(item.due_date).toLocaleDateString("pt-BR") : "-"}</TableCell>
                    <TableCell className="text-right">{formatFinancialCurrency(item.amount)}</TableCell>
                    <TableCell className="text-right">
                      {item.status === "pending" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTransactionId(item.id);
                            setPayOpen(true);
                          }}
                        >
                          Quitar
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TransactionActionDialog
            open={createOpen}
            mode="create"
            defaultTransactionType="expense"
            isLoading={createTransaction.isLoading}
            onOpenChange={setCreateOpen}
            onSubmit={handleCreateSubmit}
          />

          <TransactionActionDialog
            open={payOpen}
            mode="pay"
            isLoading={payTransaction.isLoading}
            onOpenChange={setPayOpen}
            onSubmit={handlePaySubmit}
          />
        </div>
      </div>
    </div>
  );
}
