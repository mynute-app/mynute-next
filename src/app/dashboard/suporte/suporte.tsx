"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  LifeBuoy,
  MessageSquare,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTenantSlug } from "@/hooks/use-tenant-slug";
import { buildTenantPath } from "@/lib/tenant";
import Link from "next/link";
import { cn } from "@/lib/utils";

type TicketStatus = "open" | "in_progress" | "closed";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  created_at: number;
  updated_at: number;
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

export const SuportePage = () => {
  const tenant = useTenantSlug();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/support/tickets");
      if (!res.ok) throw new Error("Erro ao carregar chamados");
      const data: TicketListResponse = await res.json();
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      setFormError("Título e descrição são obrigatórios.");
      return;
    }
    try {
      setCreating(true);
      setFormError(null);
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar chamado");
      }
      setCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      fetchTickets();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro ao criar chamado",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LifeBuoy className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Suporte</h1>
            <p className="text-sm text-muted-foreground">
              {total} chamado{total !== 1 ? "s" : ""} no total
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Chamado
        </Button>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
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
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">
              Nenhum chamado aberto
            </p>
            <p className="text-sm text-muted-foreground/60">
              Clique em "Novo Chamado" para entrar em contato com o suporte.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="flex flex-col gap-3">
          {tickets.map(ticket => (
            <Link
              key={ticket.id}
              href={buildTenantPath(
                tenant,
                `/dashboard/suporte/${ticket.id}`,
                `/dashboard/suporte/${ticket.id}`,
              )}
              className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={statusVariant[ticket.status as TicketStatus]}>
                    {statusLabel[ticket.status as TicketStatus] ||
                      ticket.status}
                  </Badge>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Chamado de Suporte</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ticket-title">Título</Label>
              <Input
                id="ticket-title"
                placeholder="Descreva brevemente o problema"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ticket-description">Descrição</Label>
              <Textarea
                id="ticket-description"
                placeholder="Explique o problema com mais detalhes..."
                rows={4}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Enviando..." : "Abrir Chamado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
