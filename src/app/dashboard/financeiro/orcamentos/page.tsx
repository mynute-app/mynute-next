"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useClientQuotes,
  useCreateClientQuote,
  useUpdateClientQuoteStatus,
} from "@/hooks/financial/use-client-quotes";
import { useCreateFinancialBudget, useFinancialBudgets } from "@/hooks/financial/use-financial-budgets";
import { getQuoteStatusLabel } from "@/lib/financial-display";
import { formatFinancialCurrency } from "@/lib/financial-utils";

export default function OrcamentosPage() {
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [quoteClientName, setQuoteClientName] = useState("");
  const [quoteItemDescription, setQuoteItemDescription] = useState("");
  const [quoteItemValue, setQuoteItemValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: quotes, isLoading: loadingQuotes, refetch: refetchQuotes } = useClientQuotes();
  const { data: budgets, isLoading: loadingBudgets, refetch: refetchBudgets } = useFinancialBudgets();
  const { mutate: createBudget, isLoading: creatingBudget } = useCreateFinancialBudget();
  const { mutate: createQuote, isLoading: creatingQuote } = useCreateClientQuote();
  const { mutate: updateQuoteStatus } = useUpdateClientQuoteStatus();

  const handleCreateBudget = async () => {
    const amount = Math.round(Number(budgetAmount || "0") * 100);
    if (!budgetName.trim() || amount <= 0) {
      setErrorMessage("Informe nome e valor valido para o budget.");
      return;
    }

    setErrorMessage(null);
    await createBudget({
      name: budgetName.trim(),
      amount,
      period_start: new Date().toISOString().slice(0, 10),
      period_end: new Date().toISOString().slice(0, 10),
    });
    setBudgetName("");
    setBudgetAmount("");
    refetchBudgets();
  };

  const handleCreateQuote = async () => {
    const unitPrice = Math.round(Number(quoteItemValue || "0") * 100);
    if (!quoteClientName.trim() || !quoteItemDescription.trim() || unitPrice <= 0) {
      setErrorMessage("Preencha cliente, item e valor para criar o orçamento.");
      return;
    }

    setErrorMessage(null);
    await createQuote({
      client_name: quoteClientName.trim(),
      items: [
        {
          description: quoteItemDescription.trim(),
          quantity: 1,
          unit_price: unitPrice,
        },
      ],
    });
    setQuoteClientName("");
    setQuoteItemDescription("");
    setQuoteItemValue("");
    refetchQuotes();
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateQuoteStatus(id, status);
    refetchQuotes();
  };

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Orçamentos</h1>

          {errorMessage ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <Tabs defaultValue="quotes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="quotes">Orçamentos (Clientes)</TabsTrigger>
              <TabsTrigger value="budgets">Budgets (Interno)</TabsTrigger>
            </TabsList>

            <TabsContent value="quotes">
              <div className="mb-4 grid gap-3 md:grid-cols-4">
                <Input
                  placeholder="Cliente"
                  value={quoteClientName}
                  onChange={(event) => setQuoteClientName(event.target.value)}
                />
                <Input
                  placeholder="Descricao do item"
                  value={quoteItemDescription}
                  onChange={(event) => setQuoteItemDescription(event.target.value)}
                />
                <Input
                  placeholder="Valor do item"
                  type="number"
                  min="0"
                  step="0.01"
                  value={quoteItemValue}
                  onChange={(event) => setQuoteItemValue(event.target.value)}
                />
                <Button onClick={handleCreateQuote} disabled={creatingQuote}>Criar orçamento</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingQuotes ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow>
                  ) : (quotes ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem orçamentos.</TableCell></TableRow>
                  ) : (
                    (quotes ?? []).map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.client_name}</TableCell>
                        <TableCell><Badge variant="secondary">{getQuoteStatusLabel(item.status)}</Badge></TableCell>
                        <TableCell>{item.valid_until ? new Date(item.valid_until).toLocaleDateString("pt-BR") : "-"}</TableCell>
                        <TableCell className="text-right">{formatFinancialCurrency(item.total_amount)}</TableCell>
                        <TableCell className="text-right">
                          {item.status === "draft" || item.status === "sent" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(item.id, "approved")}
                            >
                              Aprovar
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
            </TabsContent>

            <TabsContent value="budgets">
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Nome do budget"
                  value={budgetName}
                  onChange={(event) => setBudgetName(event.target.value)}
                />
                <Input
                  placeholder="Valor orcado"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetAmount}
                  onChange={(event) => setBudgetAmount(event.target.value)}
                />
                <Button onClick={handleCreateBudget} disabled={creatingBudget}>Criar budget</Button>
              </div>

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
