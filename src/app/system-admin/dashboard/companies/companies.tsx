"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminCompanies } from "@/hooks/system-admin/use-admin-companies";
import type { AdminCompany } from "@/types/system-admin-company";

function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, error, refetch, hasFetched, total } = useAdminCompanies({
    page,
    pageSize,
  });

  useEffect(() => {
    if (data?.companies) {
      setCompanies(data.companies);
    }
  }, [data]);

  const totalPages = useMemo(() => {
    if (!total) return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  useEffect(() => {
    if (!hasFetched) return;
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, hasFetched]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter(c =>
      c.trading_name.toLowerCase().includes(term) ||
      c.legal_name.toLowerCase().includes(term) ||
      formatCNPJ(c.tax_id).includes(term) ||
      c.subdomains.some(s => s.name.toLowerCase().includes(term)) ||
      c.sectors.some(s => s.name.toLowerCase().includes(term)),
    );
  }, [companies, searchTerm]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-6 pb-12">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Empresas</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Todas as empresas cadastradas na plataforma
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CNPJ, subdomínio ou setor..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {isLoading || !hasFetched ? (
              <TableSkeleton />
            ) : error ? (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <ErrorState
                  title="Erro ao carregar empresas"
                  description={error}
                  onRetry={refetch}
                />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-medium mb-1">Nenhuma empresa encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Tente buscar com outros termos" : "Nenhuma empresa cadastrada ainda"}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Nome Fantasia</TableHead>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Setores</TableHead>
                      <TableHead>Subdomínios</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(company => (
                      <TableRow key={company.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{company.trading_name}</TableCell>
                        <TableCell className="text-muted-foreground">{company.legal_name}</TableCell>
                        <TableCell className="font-mono text-sm">{formatCNPJ(company.tax_id)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {company.sectors.length > 0 ? (
                              company.sectors.slice(0, 2).map(sector => (
                                <Badge key={sector.id} variant="secondary" className="text-xs">
                                  {sector.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                            {company.sectors.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{company.sectors.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {company.subdomains.length > 0 ? (
                              company.subdomains.slice(0, 2).map(sub => (
                                <Badge key={sub.id} variant="outline" className="text-xs font-mono">
                                  {sub.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/system-admin/dashboard/companies/${company.id}`}>
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                              Ver
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isLoading && hasFetched && !error && total > 0 && (
              <DataPagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={value => {
                  setPageSize(value);
                  setPage(1);
                }}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
