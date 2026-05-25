"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type WhatsAppStatus = {
  connected: boolean;
  status?: string;
  error?: string;
};

type QrCode = {
  qrCode?: string;
  error?: string;
};

export default function AdminWhatsAppPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [qrCode, setQrCode] = useState<QrCode | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchStatus = useCallback(async () => {
    const controller = new AbortController();
    try {
      const res = await fetch("/api/admin/whatsapp/status", { signal: controller.signal });
      const json = await res.json();
      if (mountedRef.current) {
        setStatus(json?.data ?? json);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (mountedRef.current) {
        setStatus({ connected: false, error: "Erro ao verificar status" });
      }
    }
    return controller;
  }, []);

  const fetchQrCode = useCallback(async () => {
    const controller = new AbortController();
    try {
      const res = await fetch("/api/admin/whatsapp/qr-code", { signal: controller.signal });
      const json = await res.json();
      if (mountedRef.current) {
        setQrCode(json?.data ?? json);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (mountedRef.current) {
        setQrCode({ error: "Erro ao buscar QR code" });
      }
    }
    return controller;
  }, []);

  // Poll status every 5s
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Poll QR code every 30s when disconnected
  useEffect(() => {
    if (status?.connected === false) {
      fetchQrCode();
      const interval = setInterval(fetchQrCode, 30000);
      return () => clearInterval(interval);
    }
  }, [status?.connected, fetchQrCode]);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/admin/whatsapp/disconnect", { method: "POST" });
      if (mountedRef.current) {
        await fetchStatus();
      }
    } finally {
      if (mountedRef.current) {
        setDisconnecting(false);
      }
    }
  };

  const isConnected = status?.connected === true;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">WhatsApp</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Status
            {status === null ? (
              <Badge variant="secondary">Carregando...</Badge>
            ) : isConnected ? (
              <Badge className="bg-green-500 text-white">Conectado</Badge>
            ) : (
              <Badge variant="destructive">Desconectado</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected && qrCode?.qrCode && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Escaneie o QR code com o WhatsApp. O codigo atualiza
                automaticamente a cada 30 segundos.
              </p>
              <img
                src={qrCode.qrCode}
                alt="QR Code WhatsApp"
                className="w-64 h-64 rounded border"
              />
            </div>
          )}
          {!isConnected && qrCode?.error && (
            <p className="text-sm text-destructive">{qrCode.error}</p>
          )}
          {isConnected && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={disconnecting}>
                  {disconnecting ? "Desconectando..." : "Desconectar"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Desconectar WhatsApp?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá encerrar a conexão com o WhatsApp. As notificações
                    automáticas de agendamento serão interrompidas até que o dispositivo
                    seja reconectado via QR code.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisconnect}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Desconectar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
