"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SupplierDialog } from "@/components/suppliers/SupplierDialog";
import { ErrorState } from "@/components/ui/error-state";
import { DataPagination } from "@/components/ui/data-pagination";
import { useCompanySuppliers } from "@/hooks/use-company-suppliers";
import { useTenantSlug } from "@/hooks/use-tenant-slug";
import { buildTenantPath } from "@/lib/tenant";
import type { CompanySupplier } from "@/types/company-supplier";
import { useToast } from "@/hooks/use-toast";

const formatAddress = (supplier: CompanySupplier) => {
  const line1 = [supplier.street, supplier.number].filter(Boolean).join(", ");
  const cityState = [supplier.city, supplier.state].filter(Boolean).join(" - ");
  const line2 = [supplier.neighborhood, cityState].filter(Boolean).join(" • ");
  return [line1, line2].filter(Boolean).join(" • ");
};

export const FornecedoresPage = () => {
  const tenant = useTenantSlug();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<CompanySupplier[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<CompanySupplier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] =
    useState<CompanySupplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error, refetch, hasFetched, total } =
    useCompanySuppliers({ page, pageSize });

  useEffect(() => {
    if (data?.company_suppliers) {
      setSuppliers(data.company_suppliers);
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

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return suppliers;

    return suppliers.filter((s) => {
      const fullName = `${s.name} ${s.surname}`.toLowerCase();
      const address = formatAddress(s).toLowerCase();
      return (
        fullName.includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.phone.toLowerCase().includes(term) ||
        address.includes(term)
      );
    });
  }, [suppliers, searchTerm]);

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setDialogOpen(true);
  };

  const handleEditSupplier = (supplier: CompanySupplier) => {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDeleteClick = (supplier: CompanySupplier) => {
    setSupplierToDelete(supplier);
    setTimeout(() => setDeleteDialogOpen(true), 0);
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!supplierToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/company-supplier/${supplierToDelete.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao excluir fornecedor");
      }

      setSuppliers((prev) => prev.filter((s) => s.id !== supplierToDelete.id));
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
      refetch();
    } catch (err) {
      toast({
        title: "Erro ao excluir fornecedor",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [supplierToDelete, refetch, toast]);

  const handleDialogSuccess = (saved: CompanySupplier) => {
    if (editingSupplier) {
      // Atualiza na lista local
      setSuppliers((prev) =>
        prev.map((s) => (s.id === saved.id ? saved : s))
      );
    } else {
      // Novo fornecedor: vai para a primeira página
      if (page !== 1) setPage(1);
      setSuppliers((prev) => [saved, ...prev]);
      refetch();
    }
    setDialogOpen(false);
  };

  return (
    <div className="fornecedores-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-6 pb-12 lg:pt-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="page-header mb-0">
                <h1 className="page-title">Fornecedores</h1>
                <p className="page-description">
                  Gerencie seus fornecedores e histórico financeiro
                </p>
              </div>
              <Button className="btn-gradient" onClick={handleNewSupplier}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Fornecedor
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou endereço..."
                  className="pl-9 input-focus"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {isLoading || !hasFetched ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-muted" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <ErrorState
                  title="Erro ao carregar fornecedores"
                  description={error}
                  onRetry={refetch}
                />
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">
                  Nenhum fornecedor encontrado
                </h3>
                <p className="mb-4 text-muted-foreground">
                  {searchTerm
                    ? "Tente buscar com outros termos"
                    : "Comece cadastrando seu primeiro fornecedor"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleNewSupplier} className="btn-gradient">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Fornecedor
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm card-hover"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {supplier.name}{" "}
                            {supplier.surname ? supplier.surname : ""}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Fornecedor
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(supplier)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">
                          {formatAddress(supplier) || "Endereço não informado"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <Link
                          href={buildTenantPath(
                            tenant,
                            `/dashboard/fornecedores/${supplier.id}`,
                            `/dashboard/fornecedores/${supplier.id}`
                          )}
                        >
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && hasFetched && !error && total > 0 && (
              <DataPagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <SupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={editingSupplier}
        onSuccess={handleDialogSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{supplierToDelete?.name}&quot;? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
