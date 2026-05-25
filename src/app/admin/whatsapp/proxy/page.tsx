"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function AdminProxyPage() {
  const { toast } = useToast();
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load current proxy configuration on mount
  useEffect(() => {
    fetch("/api/admin/proxy")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        setHost(data.host ?? "");
        setPort(data.port ?? "");
        setUsername(data.username ?? "");
        setEnabled(data.enabled ?? false);
        // Do not pre-fill password for security
      })
      .catch(() => {
        toast({
          title: "Erro ao carregar configurações de proxy",
          description: "Não foi possível buscar as configurações atuais.",
          variant: "destructive",
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/proxy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, port, username, password, enabled }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      toast({ title: "Configuracoes de proxy salvas com sucesso." });
    } catch (err) {
      toast({
        title: "Erro ao salvar configuracoes",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Configuracao de Proxy</h1>

      <Card>
        <CardHeader>
          <CardTitle>Proxy HTTP/SOCKS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proxy-host">Host</Label>
              <Input
                id="proxy-host"
                value={host}
                onChange={e => setHost(e.target.value)}
                placeholder="proxy.exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proxy-port">Porta</Label>
              <Input
                id="proxy-port"
                value={port}
                onChange={e => setPort(e.target.value)}
                placeholder="8080"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proxy-username">Usuario</Label>
            <Input
              id="proxy-username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="usuario"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proxy-password">Senha</Label>
            <Input
              id="proxy-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="proxy-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="proxy-enabled">Habilitado</Label>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
