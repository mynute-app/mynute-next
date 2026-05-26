"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useClientQuotes } from "@/hooks/financial/use-client-quotes";
import { useFinancialBudgets } from "@/hooks/financial/use-financial-budgets";
import { formatFinancialCurrency } from "@/lib/financial-utils";

export default function OrcamentosPage() {
  const { data: quotes, isLoading: loadingQuotes } = useClientQuotes();
  const { data: budgets, isLoading: loadingBudgets } = useFinancialBudgets();

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Orçamentos</h1>

          <Tabs defaultValue="quotes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="quotes">Orçamentos (Clientes)</TabsTrigger>
              <TabsTrigger value="budgets">Budgets (Interno)</TabsTrigger>
            </TabsList>

            <TabsContent value="quotes">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingQuotes ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>
                  ) : (quotes ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sem orçamentos.</TableCell></TableRow>
                  ) : (
                    (quotes ?? []).map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.client_name}</TableCell>
                        <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                        <TableCell>{item.valid_until ? new Date(item.valid_until).toLocaleDateString("pt-BR") : "-"}</TableCell>
                        <TableCell className="text-right">{formatFinancialCurrency(item.total_amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="budgets">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Orçado</TableHead>
                    <TableHead className="text-right">Realizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingBudgets ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>
                  ) : (budgets ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sem budgets.</TableCell></TableRow>
                  ) : (
                    (budgets ?? []).map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {new Date(item.period_start).toLocaleDateString("pt-BR")} - {new Date(item.period_end).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">{formatFinancialCurrency(item.amount)}</TableCell>
                        <TableCell className="text-right">{formatFinancialCurrency(item.realized)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
