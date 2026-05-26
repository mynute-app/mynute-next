"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRangeFilter } from "@/app/dashboard/financeiro/_components/date-range-filter";
import {
  useAppointmentsRevenueReport,
  useDREReport,
  usePayablesReport,
  useReceivablesReport,
} from "@/hooks/financial/use-financial-reports";
import { getTransactionStatusLabel } from "@/lib/financial-display";
import { formatFinancialCurrency } from "@/lib/financial-utils";

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  .toISOString()
  .slice(0, 10);
const endDate = today.toISOString().slice(0, 10);

export default function RelatoriosFinanceirosPage() {
  const [startDate, setStartDate] = useState(firstDay);
  const [rangeEndDate, setRangeEndDate] = useState(endDate);

  const params = { start_date: startDate, end_date: rangeEndDate };
  const dre = useDREReport(params);
  const revenue = useAppointmentsRevenueReport(params);
  const receivables = useReceivablesReport(params);
  const payables = usePayablesReport(params);

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h1>

          <DateRangeFilter
            startDate={startDate}
            endDate={rangeEndDate}
            onApply={(nextStartDate, nextEndDate) => {
              setStartDate(nextStartDate);
              setRangeEndDate(nextEndDate);
            }}
          />

          <Tabs defaultValue="dre" className="space-y-4">
            <TabsList>
              <TabsTrigger value="dre">DRE</TabsTrigger>
              <TabsTrigger value="revenue">Receita por Agendamento</TabsTrigger>
              <TabsTrigger value="receivables">A Receber</TabsTrigger>
              <TabsTrigger value="payables">A Pagar</TabsTrigger>
            </TabsList>

            <TabsContent value="dre">
              {dre.error ? (
                <div className="mb-3 flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <span>{dre.error}</span>
                  <Button variant="outline" size="sm" onClick={dre.refetch}>Tentar novamente</Button>
                </div>
              ) : null}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dre.isLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center">Carregando...</TableCell></TableRow>
                  ) : (dre.data?.income_by_category ?? []).length === 0 && (dre.data?.expense_by_category ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Sem dados no período.</TableCell></TableRow>
                  ) : (
                    <>
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
                    </>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="revenue">
              {revenue.error ? (
                <div className="mb-3 flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <span>{revenue.error}</span>
                  <Button variant="outline" size="sm" onClick={revenue.refetch}>Tentar novamente</Button>
                </div>
              ) : null}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Forma de pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenue.isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Carregando...</TableCell></TableRow>
                  ) : (revenue.data?.entries ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Sem dados no período.</TableCell></TableRow>
                  ) : (
                    (revenue.data?.entries ?? []).map(item => (
                    <TableRow key={item.appointment_id}>
                      <TableCell>{item.service_name}</TableCell>
                      <TableCell>{item.payment_method || "-"}</TableCell>
                      <TableCell className="text-right">{formatFinancialCurrency(item.charged_amount ?? item.amount)}</TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="receivables">
              {receivables.error ? (
                <div className="mb-3 flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <span>{receivables.error}</span>
                  <Button variant="outline" size="sm" onClick={receivables.refetch}>Tentar novamente</Button>
                </div>
              ) : null}

              <p className="mb-3 text-sm text-muted-foreground">
                Pendente: {formatFinancialCurrency(receivables.data?.total_pending ?? 0)} | Vencido: {formatFinancialCurrency(receivables.data?.total_overdue ?? 0)}
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descricao</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivables.isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Carregando...</TableCell></TableRow>
                  ) : (receivables.data?.transactions ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Sem contas a receber no período.</TableCell></TableRow>
                  ) : (
                    (receivables.data?.transactions ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{getTransactionStatusLabel(item.status)}</TableCell>
                        <TableCell className="text-right">{formatFinancialCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="payables">
              {payables.error ? (
                <div className="mb-3 flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <span>{payables.error}</span>
                  <Button variant="outline" size="sm" onClick={payables.refetch}>Tentar novamente</Button>
                </div>
              ) : null}

              <p className="mb-3 text-sm text-muted-foreground">
                Pendente: {formatFinancialCurrency(payables.data?.total_pending ?? 0)} | Vencido: {formatFinancialCurrency(payables.data?.total_overdue ?? 0)}
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descricao</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payables.isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Carregando...</TableCell></TableRow>
                  ) : (payables.data?.transactions ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Sem contas a pagar no período.</TableCell></TableRow>
                  ) : (
                    (payables.data?.transactions ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{getTransactionStatusLabel(item.status)}</TableCell>
                        <TableCell className="text-right">{formatFinancialCurrency(item.amount)}</TableCell>
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
