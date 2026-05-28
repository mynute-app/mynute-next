"use client";

import { useEffect, useState } from "react";
import { GitMerge, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMergeCompanySuppliers } from "@/hooks/company-supplier/use-merge-company-suppliers";
import { useCompanySuppliers } from "@/hooks/use-company-suppliers";
import type { CompanySupplier } from "@/types/company-supplier";

interface MergeSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keepSupplier: CompanySupplier;
  onSuccess: () => void;
}

export function MergeSupplierDialog({
  open,
  onOpenChange,
  keepSupplier,
  onSuccess,
}: MergeSupplierDialogProps) {
  const [deleteId, setDeleteId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { merge, isLoading, error } = useMergeCompanySuppliers();

  // Debounce the search query by 300 ms to avoid hammering the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch candidates from the server — search-filtered and capped at 20 results.
  // Enabled only while the dialog is open to avoid unnecessary requests.
  const {
    data: searchData,
    isLoading: isFetchingSuppliers,
    error: fetchError,
  } = useCompanySuppliers({
    search: debouncedSearch,
    pageSize: 20,
    enabled: open,
  });

  const candidatesToDelete = (searchData?.company_suppliers ?? []).filter(
    (s) => s.id !== keepSupplier.id
  );

  const handleMerge = async () => {
    if (!deleteId) return;
    const success = await merge({
      keep_id: keepSupplier.id,
      delete_id: deleteId,
    });
    if (success) {
      setDeleteId("");
      setSearchQuery("");
      onOpenChange(false);
      onSuccess();
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setDeleteId("");
      setSearchQuery("");
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-primary" />
            Mesclar Fornecedor
          </DialogTitle>
          <DialogDescription>
            Selecione o fornecedor que será mesclado com{" "}
            <span className="font-medium text-foreground">
              {keepSupplier.name} {keepSupplier.surname ?? ""}
            </span>
            . O fornecedor selecionado abaixo será excluído e suas transações
            financeiras serão transferidas para o fornecedor mantido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Fornecedor a excluir (origem)</p>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDeleteId("");
                }}
                className="pl-8"
              />
            </div>

            {fetchError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Erro ao carregar fornecedores: {fetchError}
                </AlertDescription>
              </Alert>
            ) : isFetchingSuppliers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando fornecedores...
              </div>
            ) : candidatesToDelete.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? "Nenhum fornecedor encontrado para essa busca."
                  : "Nenhum outro fornecedor disponível para mesclar."}
              </p>
            ) : (
              <Select value={deleteId} onValueChange={setDeleteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor a ser excluído" />
                </SelectTrigger>
                <SelectContent>
                  {candidatesToDelete.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.surname ?? ""} — {s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleMerge}
            disabled={!deleteId || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mesclando...
              </>
            ) : (
              <>
                <GitMerge className="mr-2 h-4 w-4" />
                Mesclar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
