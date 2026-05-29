"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminClients } from "@/hooks/system-admin/use-admin-clients";
import { useDebounce } from "@/hooks/use-debounce";
import type { AdminClient } from "@/types/system-admin-client";

const PAGE_SIZE = 10;

function ClientsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function ClientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { clients, total, isLoading, hasFetched, error } = useAdminClients({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleRowClick(client: AdminClient) {
    router.push(`/system-admin/dashboard/users/${client.id}`);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-6 pb-12">
            <div>
              <h1 className="text-2xl font-bold">Usuarios</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Todos os clientes cadastrados na plataforma
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email..."
                  className="pl-9"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {isLoading || !hasFetched ? (
              <ClientsSkeleton />
            ) : error ? (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  {search
                    ? "Nenhum cliente encontrado para a busca."
                    : "Nenhum cliente cadastrado."}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Email</TableHead>
                        <TableHead>ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map(client => (
                        <TableRow
                          key={client.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleRowClick(client)}
                        >
                          <TableCell className="font-medium">
                            {client.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {client.id}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <DataPagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={total}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
