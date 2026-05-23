"use client";

import { useCallback, useEffect, useState } from "react";
import { Headphones, ChevronRight, Clock, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";

type TicketStatus = "open" | "in_progress" | "closed";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  company_id: string;
  company_name: string;
  created_at: number;
}

interface TicketListResponse {
  tickets: SupportTicket[];
  total: number;
  page: number;
  page_size: number;
}

const statusLabel: Record<TicketStatus, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  closed: "Fechado",
};

const statusVariant: Record<TicketStatus, "default" | "secondary" | "outline"> =
  {
    open: "default",
    in_progress: "secondary",
    closed: "outline",
  };

export const AdminSuportePage = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: "1", page_size: "50" });
      if (statusFilter && statusFilter !== "all")
        params.set("status", statusFilter);
      const res = await fetch(`/api/system-admin/support?${params}`);
      if (!res.ok) throw new Error("Erro ao carregar chamados");
      const data: TicketListResponse = await res.json();
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Headphones className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Suporte</h1>
            <p className="text-sm text-muted-foreground">
              {total} chamado{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <Headphones className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Nenhum chamado encontrado.</p>
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="flex flex-col gap-3">
          {tickets.map(ticket => (
            <Link
              key={ticket.id}
              href={`/system-admin/dashboard/support/${ticket.id}`}
              className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={statusVariant[ticket.status as TicketStatus]}>
                    {statusLabel[ticket.status as TicketStatus] ||
                      ticket.status}
                  </Badge>
                  <span className="text-xs font-medium text-primary">
                    {ticket.company_name}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(ticket.created_at * 1000).toLocaleDateString(
                      "pt-BR",
                    )}
                  </span>
                </div>
                <p className="font-medium truncate">{ticket.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {ticket.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
