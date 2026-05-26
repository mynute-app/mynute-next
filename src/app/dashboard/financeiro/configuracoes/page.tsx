"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreateFinancialAccount, useFinancialAccounts } from "@/hooks/financial/use-financial-accounts";
import { useCreateFinancialCategory, useFinancialCategories } from "@/hooks/financial/use-financial-categories";
import { formatFinancialCurrency } from "@/lib/financial-utils";

export default function ConfiguracoesFinanceirasPage() {
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("cash");
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("income");
  const [formError, setFormError] = useState<string | null>(null);

  const accounts = useFinancialAccounts();
  const categories = useFinancialCategories();
  const createAccount = useCreateFinancialAccount();
  const createCategory = useCreateFinancialCategory();

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      setFormError("Informe o nome da conta.");
      return;
    }

    setFormError(null);
    await createAccount.mutate({ name: accountName.trim(), account_type: accountType as "cash" | "bank" | "credit_card" | "other" });
    setAccountName("");
    await accounts.refetch();
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      setFormError("Informe o nome da categoria.");
      return;
    }

    setFormError(null);
    await createCategory.mutate({ name: categoryName.trim(), category_type: categoryType as "income" | "expense" });
    setCategoryName("");
    await categories.refetch();
  };

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Configurações Financeiras</h1>

          {formError ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Contas Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Nome da conta"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                />
                <select
                  value={accountType}
                  onChange={(event) => setAccountType(event.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="bank">Banco</option>
                  <option value="credit_card">Cartao de credito</option>
                  <option value="other">Outro</option>
                </select>
                <Button onClick={handleCreateAccount} disabled={createAccount.isLoading}>Criar conta</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Carregando...</TableCell></TableRow>
                  ) : (accounts.data ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Sem contas cadastradas.</TableCell></TableRow>
                  ) : (
                    (accounts.data ?? []).map(account => (
                    <TableRow key={account.id}>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>{account.account_type}</TableCell>
                      <TableCell className="text-right">{formatFinancialCurrency(account.balance)}</TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Nome da categoria"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                />
                <select
                  value={categoryType}
                  onChange={(event) => setCategoryType(event.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
                <Button onClick={handleCreateCategory} disabled={createCategory.isLoading}>Criar categoria</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ativa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Carregando...</TableCell></TableRow>
                  ) : (categories.data ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Sem categorias cadastradas.</TableCell></TableRow>
                  ) : (
                    (categories.data ?? []).map(category => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.category_type}</TableCell>
                      <TableCell>{category.is_active ? "Sim" : "Não"}</TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
