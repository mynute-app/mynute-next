"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFinancialTransactions } from "@/hooks/financial/use-financial-transactions";
import { formatFinancialCurrency } from "@/lib/financial-utils";

export default function ContasAReceberPage() {
  const { data, isLoading } = useFinancialTransactions({ type: "income" });

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Contas a Receber</h1>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>
              ) : (data ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sem lançamentos.</TableCell></TableRow>
              ) : (
                (data ?? []).map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                    <TableCell>{item.due_date ? new Date(item.due_date).toLocaleDateString("pt-BR") : "-"}</TableCell>
                    <TableCell className="text-right">{formatFinancialCurrency(item.amount)}</TableCell>
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
