"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useAppointmentsRevenueReport,
  useDREReport,
  usePayablesReport,
  useReceivablesReport,
} from "@/hooks/financial/use-financial-reports";
import { formatFinancialCurrency } from "@/lib/financial-utils";

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  .toISOString()
  .slice(0, 10);
const endDate = today.toISOString().slice(0, 10);

export default function RelatoriosFinanceirosPage() {
  const dre = useDREReport({ start_date: firstDay, end_date: endDate });
  const revenue = useAppointmentsRevenueReport({ start_date: firstDay, end_date: endDate });
  const receivables = useReceivablesReport({ start_date: firstDay, end_date: endDate });
  const payables = usePayablesReport({ start_date: firstDay, end_date: endDate });

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h1>

          <Tabs defaultValue="dre" className="space-y-4">
            <TabsList>
              <TabsTrigger value="dre">DRE</TabsTrigger>
              <TabsTrigger value="revenue">Receita por Agendamento</TabsTrigger>
              <TabsTrigger value="receivables">A Receber</TabsTrigger>
              <TabsTrigger value="payables">A Pagar</TabsTrigger>
            </TabsList>

            <TabsContent value="dre">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dre.data?.income_by_category ?? []).map(item => (
                    <TableRow key={`in-${item.category_id ?? item.category_name}`}>
                      <TableCell>Receita: {item.category_name}</TableCell>
                      <TableCell className="text-right">{formatFinancialCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                  {(dre.data?.expense_by_category ?? []).map(item => (
                    <TableRow key={`ex-${item.category_id ?? item.category_name}`}>
                      <TableCell>Despesa: {item.category_name}</TableCell>
                      <TableCell className="text-right">{formatFinancialCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="revenue">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Forma de pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(revenue.data?.entries ?? []).map(item => (
                    <TableRow key={item.appointment_id}>
                      <TableCell>{item.service_name}</TableCell>
                      <TableCell>{item.payment_method || "-"}</TableCell>
                      <TableCell className="text-right">{formatFinancialCurrency(item.charged_amount ?? item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="receivables">
              <p className="text-sm text-muted-foreground">
                Pendente: {formatFinancialCurrency(receivables.data?.total_pending ?? 0)} | Vencido: {formatFinancialCurrency(receivables.data?.total_overdue ?? 0)}
              </p>
            </TabsContent>

            <TabsContent value="payables">
              <p className="text-sm text-muted-foreground">
                Pendente: {formatFinancialCurrency(payables.data?.total_pending ?? 0)} | Vencido: {formatFinancialCurrency(payables.data?.total_overdue ?? 0)}
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
