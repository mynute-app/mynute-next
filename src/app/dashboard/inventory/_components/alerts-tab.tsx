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
import { fetchAlerts, resolveAlert, ignoreAlert } from "@/hooks/inventory/use-inventory-api";
import type { InventoryAlert, AlertStatus, AlertSeverity } from "@/types/inventory";
import { CheckCircle, EyeOff } from "lucide-react";

const PAGE_SIZE = 20;

const severityVariant = (
  severity: AlertSeverity,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity) {
    case "critical":
      return "destructive";
    case "warning":
      return "default";
    default:
      return "secondary";
  }
};

const severityLabels: Record<AlertSeverity, string> = {
  critical: "Crítico",
  warning: "Atenção",
  info: "Info",
};

const statusLabels: Record<AlertStatus, string> = {
  open: "Aberto",
  resolved: "Resolvido",
  ignored: "Ignorado",
};

export function AlertsTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = parseInt(searchParams.get("alerts_page") ?? "1");
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const setPage = useCallback((newPage: number | ((prev: number) => number)) => {
    setPageState(prev => {
      const next = typeof newPage === "function" ? newPage(prev) : newPage;
      const params = new URLSearchParams(searchParams.toString());
      if (next === 1) {
        params.delete("alerts_page");
      } else {
        params.set("alerts_page", String(next));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return next;
    });
  }, [searchParams, router, pathname]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadAlerts = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const result = await fetchAlerts({ page: currentPage, page_size: PAGE_SIZE, status: "open" });
      setAlerts(result.alerts ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast({
        title: "Erro ao carregar alertas",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadAlerts(page);
  }, [loadAlerts, page]);

  const handleResolve = async (id: string) => {
    setProcessingId(id);
    try {
      await resolveAlert(id);
      toast({ title: "Alerta resolvido." });
      setAlerts(prev => prev.filter(a => a.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch {
      toast({
        title: "Erro ao resolver alerta",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleIgnore = async (id: string) => {
    setProcessingId(id);
    try {
      await ignoreAlert(id);
      toast({ title: "Alerta ignorado." });
      setAlerts(prev => prev.filter(a => a.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch {
      toast({
        title: "Erro ao ignorar alerta",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
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

  if (alerts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        Nenhum alerta aberto no momento.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severidade</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map(alert => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Badge variant={severityVariant(alert.severity)}>
                    {severityLabels[alert.severity]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <span className="text-sm">{alert.message}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {statusLabels[alert.status]}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(alert.triggered_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingId === alert.id}
                      onClick={() => void handleResolve(alert.id)}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Resolver
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={processingId === alert.id}
                      onClick={() => void handleIgnore(alert.id)}
                    >
                      <EyeOff className="mr-1 h-3 w-3" />
                      Ignorar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({total} alerta{total !== 1 ? "s" : ""})
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
    </div>
  );
}
