"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCashFlowReport } from "@/hooks/financial/use-financial-reports";
import { useFinancialTransactions } from "@/hooks/financial/use-financial-transactions";
import { formatFinancialCurrency } from "@/lib/financial-utils";

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  .toISOString()
  .slice(0, 10);
const todayISO = today.toISOString().slice(0, 10);

const statusVariant: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  pending: "secondary",
  paid: "default",
  overdue: "destructive",
  cancelled: "outline",
};

export function FinanceiroDashboard() {
  const { data: cashFlow } = useCashFlowReport({
    start_date: firstDay,
    end_date: todayISO,
  });
  const { data: transactions, isLoading } = useFinancialTransactions({ page_size: 10 });

  const totalIncome = cashFlow?.total_income ?? 0;
  const totalExpense = cashFlow?.total_expense ?? 0;
  const netBalance = cashFlow?.net_balance ?? 0;
  const pendingReceivables = (transactions ?? [])
    .filter(t => t.transaction_type === "income" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-muted-foreground">
              Visão geral de receitas, despesas e pendências financeiras.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Receitas do Mês</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-[hsl(var(--success))]">
                {formatFinancialCurrency(totalIncome)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Despesas do Mês</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-destructive">
                {formatFinancialCurrency(totalExpense)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saldo Líquido</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {formatFinancialCurrency(netBalance)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">A Receber em Aberto</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {formatFinancialCurrency(pendingReceivables)}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Últimas Transações</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/financeiro/contas-a-receber">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : (transactions ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhuma transação encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (transactions ?? []).slice(0, 10).map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell>{tx.transaction_type === "income" ? "Receita" : "Despesa"}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[tx.status] ?? "outline"}>{tx.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatFinancialCurrency(tx.amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/financeiro/contas-a-pagar">Nova Despesa</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/financeiro/contas-a-receber">Nova Receita</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/financeiro/orcamentos">Novo Orçamento</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
