"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinancialAccounts } from "@/hooks/financial/use-financial-accounts";
import { useFinancialCategories } from "@/hooks/financial/use-financial-categories";
import { formatFinancialCurrency } from "@/lib/financial-utils";

export default function ConfiguracoesFinanceirasPage() {
  const accounts = useFinancialAccounts();
  const categories = useFinancialCategories();

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Configurações Financeiras</h1>

          <Card>
            <CardHeader>
              <CardTitle>Contas Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(accounts.data ?? []).map(account => (
                    <TableRow key={account.id}>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>{account.account_type}</TableCell>
                      <TableCell className="text-right">{formatFinancialCurrency(account.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ativa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categories.data ?? []).map(category => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.category_type}</TableCell>
                      <TableCell>{category.is_active ? "Sim" : "Não"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
