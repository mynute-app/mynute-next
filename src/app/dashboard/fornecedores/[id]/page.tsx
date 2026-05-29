"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { DataPagination } from "@/components/ui/data-pagination";
import { useCompanySupplierDetails } from "@/hooks/company-supplier/use-company-supplier-details";
import { useCompanySupplierTransactions } from "@/hooks/company-supplier/use-company-supplier-transactions";
import { useTenantSlug } from "@/hooks/use-tenant-slug";
import { buildTenantPath } from "@/lib/tenant";
import type { FinancialTransaction } from "@/types/financial";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendente",
    className:
      "border-[hsl(var(--warning)/0.2)] bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]",
  },
  paid: {
    label: "Pago",
    className:
      "border-[hsl(var(--success)/0.2)] bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
  },
  overdue: {
    label: "Vencido",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  cancelled: {
    label: "Cancelado",
    className: "border-border bg-muted text-muted-foreground",
  },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

const PAGE_SIZE = 10;

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
    <div className="custom-scrollbar flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">{children}</div>
    </div>
  </div>
);

export default function FornecedorDetalhesPage() {
  const params = useParams<{ id: string }>();
  const supplierId = params?.id || "";
  const tenant = useTenantSlug();

  const [txPage, setTxPage] = useState(1);

  const { supplier, isLoading: isLoadingSupplier, error: supplierError } =
    useCompanySupplierDetails({ supplierId, enabled: !!supplierId });

  const { transactions, isLoading: isLoadingTx, error: txError } =
    useCompanySupplierTransactions({ supplierId, enabled: !!supplierId });

  const paginatedTransactions = useMemo(() => {
    const start = (txPage - 1) * PAGE_SIZE;
    return (transactions ?? []).slice(start, start + PAGE_SIZE);
  }, [transactions, txPage]);

  const totalTxPages = useMemo(
    () => Math.max(1, Math.ceil((transactions?.length ?? 0) / PAGE_SIZE)),
    [transactions]
  );

  const backHref = buildTenantPath(
    tenant,
    "/dashboard/fornecedores",
    "/dashboard/fornecedores"
  );

  if (isLoadingSupplier) {
    return (
      <PageShell>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-muted" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-64 rounded bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-4 w-40 rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (supplierError || !supplier) {
    return (
      <PageShell>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Fornecedores
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <ErrorState
            title="Fornecedor não encontrado"
            description={supplierError ?? "Não foi possível carregar os dados"}
          />
        </div>
      </PageShell>
    );
  }

  const address = [
    [supplier.street, supplier.number].filter(Boolean).join(", "),
    [supplier.neighborhood, supplier.city, supplier.state]
      .filter(Boolean)
      .join(" • "),
    supplier.country,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <PageShell>
      <div className="space-y-6 pb-12">
        {/* Voltar */}
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Fornecedores
          </Link>
        </Button>

        {/* Cabeçalho / informações do fornecedor */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="page-title">
                {supplier.name} {supplier.surname || ""}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {supplier.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {supplier.email}
                </span>
                {address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transações financeiras */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">Histórico Financeiro</h2>
            <p className="text-sm text-muted-foreground">
              Transações vinculadas a este fornecedor
            </p>
          </div>

          {isLoadingTx ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted" />
                    <div className="h-3 w-32 rounded bg-muted" />
                  </div>
                  <div className="h-4 w-24 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : txError ? (
            <div className="p-6">
              <ErrorState
                title="Erro ao carregar transações"
                description={txError}
              />
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma transação vinculada a este fornecedor.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {paginatedTransactions.map((tx: FinancialTransaction) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
              {(transactions?.length ?? 0) > PAGE_SIZE && (
                <div className="border-t border-border p-4">
                  <DataPagination
                    page={txPage}
                    pageSize={PAGE_SIZE}
                    total={transactions?.length ?? 0}
                    onPageChange={setTxPage}
                    onPageSizeChange={() => {}}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function TransactionRow({ transaction }: { transaction: FinancialTransaction }) {
  const isIncome = transaction.transaction_type === "income";
  const status = statusConfig[transaction.status] ?? {
    label: transaction.status,
    className: "border-border bg-muted text-muted-foreground",
  };

  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
            isIncome ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          {isIncome ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {transaction.description || "Sem descrição"}
          </p>
          <p className="text-xs text-muted-foreground">
            Vencimento: {formatDate(transaction.due_date)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <span
          className={`text-sm font-semibold ${
            isIncome ? "text-green-600 dark:text-green-400" : "text-destructive"
          }`}
        >
          {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
        </span>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </div>
    </div>
  );
}
