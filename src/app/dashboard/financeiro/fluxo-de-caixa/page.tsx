"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCashFlowReport } from "@/hooks/financial/use-financial-reports";
import { formatFinancialCurrency } from "@/lib/financial-utils";

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  .toISOString()
  .slice(0, 10);

export default function FluxoDeCaixaPage() {
  const { data, isLoading } = useCashFlowReport({
    start_date: firstDay,
    end_date: today.toISOString().slice(0, 10),
  });

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Saídas</TableHead>
                <TableHead className="text-right">Saldo do Dia</TableHead>
                <TableHead className="text-right">Saldo Acumulado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow>
              ) : (data?.entries ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem dados para o período.</TableCell></TableRow>
              ) : (
                (data?.entries ?? []).map(item => (
                  <TableRow key={item.date}>
                    <TableCell>{new Date(item.date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">{formatFinancialCurrency(item.income)}</TableCell>
                    <TableCell className="text-right">{formatFinancialCurrency(item.expense)}</TableCell>
                    <TableCell className="text-right">{formatFinancialCurrency(item.net_balance)}</TableCell>
                    <TableCell className="text-right">{formatFinancialCurrency(item.running_balance)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
