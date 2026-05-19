"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { fetchMovements } from "@/hooks/inventory/use-inventory-api";
import type { InventoryMovement } from "@/types/inventory";
import { MovementDialog } from "./movement-dialog";

const PAGE_SIZE = 20;

const formatCents = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

const movementTypeLabels: Record<string, string> = {
  initial: "Estoque inicial",
  purchase: "Compra",
  adjustment_in: "Ajuste (+)",
  adjustment_out: "Ajuste (–)",
  reservation: "Reserva",
  reservation_release: "Liberação de reserva",
  consumption: "Consumo",
  return: "Devolução",
  negative_consumption: "Consumo negativo",
};

const movementTypeVariant = (
  type: string,
): "default" | "secondary" | "outline" => {
  if (
    ["purchase", "initial", "return", "adjustment_in"].includes(type)
  )
    return "default";
  if (["adjustment_out", "consumption", "negative_consumption"].includes(type))
    return "secondary";
  return "outline";
};

export function MovementsTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = parseInt(searchParams.get("movements_page") ?? "1");
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const setPage = useCallback((newPage: number | ((prev: number) => number)) => {
    setPageState(prev => {
      const next = typeof newPage === "function" ? newPage(prev) : newPage;
      const params = new URLSearchParams(searchParams.toString());
      if (next === 1) {
        params.delete("movements_page");
      } else {
        params.set("movements_page", String(next));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return next;
    });
  }, [searchParams, router, pathname]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadMovements = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const result = await fetchMovements({ page: currentPage, page_size: PAGE_SIZE });
      setMovements(result.movements ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast({
        title: "Erro ao carregar movimentos",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadMovements(page);
  }, [loadMovements, page]);

  const handleMovementCreated = () => {
    void loadMovements(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar movimento
        </Button>
      </div>

      {movements.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          Nenhum movimento encontrado.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Custo unit.</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map(mov => (
                <TableRow key={mov.id}>
                  <TableCell>
                    <Badge variant={movementTypeVariant(mov.movement_type)}>
                      {movementTypeLabels[mov.movement_type] ?? mov.movement_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{mov.quantity}</TableCell>
                  <TableCell>{formatCents(mov.unit_cost)}</TableCell>
                  <TableCell>{formatCents(mov.total_cost)}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {mov.reason || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(mov.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({total} movimento{total !== 1 ? "s" : ""})
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <MovementDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleMovementCreated}
      />
    </div>
  );
}
