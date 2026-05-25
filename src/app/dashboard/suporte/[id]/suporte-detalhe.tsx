"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTenantSlug } from "@/hooks/use-tenant-slug";
import { buildTenantPath } from "@/lib/tenant";
import Link from "next/link";

type TicketStatus = "open" | "in_progress" | "closed";

interface SupportMessage {
  id: string;
  sender_type: "employee" | "system_admin";
  content: string;
  created_at: number;
}

interface TicketDetail {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  company_id: string;
  created_by_employee_id: string;
  created_at: number;
  updated_at: number;
  messages: SupportMessage[];
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

export const SuporteDetalhe = ({ ticketId }: { ticketId: string }) => {
  const tenant = useTenantSlug();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Erro ao carregar chamado");
      const data: TicketDetail = await res.json();
      setTicket(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 15000);
    return () => clearInterval(interval);
  }, [fetchTicket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      setSending(true);
      setSendError(null);
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao enviar mensagem");
      }
      setContent("");
      fetchTicket();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Link
          href={buildTenantPath(
            tenant,
            "/dashboard/suporte",
            "/dashboard/suporte",
          )}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
          {error || "Chamado não encontrado"}
        </div>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 gap-4">
      <div className="flex items-center gap-3">
        <Link
          href={buildTenantPath(
            tenant,
            "/dashboard/suporte",
            "/dashboard/suporte",
          )}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{ticket.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {ticket.description}
            </p>
          </div>
          <Badge variant={statusVariant[ticket.status]}>
            {statusLabel[ticket.status]}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Aberto em{" "}
          {new Date(ticket.created_at * 1000).toLocaleDateString("pt-BR")}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 min-h-0">
        {ticket.messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhuma mensagem ainda. Envie a primeira!
          </p>
        )}
        {ticket.messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[75%] rounded-lg px-4 py-2.5 text-sm",
              msg.sender_type === "employee"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start bg-muted text-foreground",
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            <p className={cn("text-xs mt-1 opacity-70")}>
              {new Date(msg.created_at * 1000).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-col gap-2">
        {sendError && <p className="text-xs text-destructive">{sendError}</p>}
        {isClosed ? (
          <p className="text-center text-sm text-muted-foreground py-2">
            Este chamado está fechado.
          </p>
        ) : (
          <div className="flex gap-2">
            <Textarea
              placeholder="Digite sua mensagem..."
              rows={2}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={sending || !content.trim()}
              size="icon"
              className="h-auto"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
