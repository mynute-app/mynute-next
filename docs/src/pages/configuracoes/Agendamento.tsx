import { Link2, Clock, Bell, Shield, QrCode, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ConfigAgendamento() {
  const bookingUrl = "https://lavable.app/agendar";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Regras de Agendamento</h1>
        <p className="page-description">
          Configure como seus clientes agendam serviços
        </p>
      </div>

      {/* Booking Links - EasyShare Style */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Links de Agendamento
        </h2>
        <div className="space-y-4">
          {/* Main Link */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-primary font-medium">Link Principal</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bookingUrl)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Abrir
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input value={bookingUrl} readOnly className="bg-background" />
              <Button variant="outline" size="icon">
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Service Links */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Links por Serviço</Label>
            {[
              { name: "Lavagem Completa", slug: "lavagem-completa" },
              { name: "Polimento", slug: "polimento" },
              { name: "Higienização", slug: "higienizacao" },
            ].map((service) => (
              <div
                key={service.slug}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <span className="font-medium text-foreground">{service.name}</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    /agendar/{service.slug}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`${bookingUrl}/${service.slug}`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Staff Links */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Links por Profissional</Label>
            {[
              { name: "Carlos", slug: "carlos" },
              { name: "Pedro", slug: "pedro" },
            ].map((staff) => (
              <div
                key={staff.slug}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <span className="font-medium text-foreground">{staff.name}</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    /agendar/com/{staff.slug}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`${bookingUrl}/com/${staff.slug}`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Flow */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Fluxo de Agendamento
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Pular seleção de profissional</Label>
              <p className="text-sm text-muted-foreground">
                Auto-atribuir o primeiro profissional disponível
              </p>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Antecedência mínima</Label>
              <Select defaultValue="2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="2">2 horas</SelectItem>
                  <SelectItem value="4">4 horas</SelectItem>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="48">48 horas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Lead time mínimo para agendar
              </p>
            </div>
            <div className="space-y-2">
              <Label>Janela máxima</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Máximo de dias no futuro
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notificações
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Confirmação por e-mail</Label>
              <p className="text-sm text-muted-foreground">
                Enviar e-mail ao confirmar agendamento
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Lembrete 24h antes</Label>
              <p className="text-sm text-muted-foreground">
                Enviar lembrete um dia antes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Lembrete 2h antes</Label>
              <p className="text-sm text-muted-foreground">
                Enviar lembrete duas horas antes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Notificação WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Enviar confirmações via WhatsApp (requer integração)
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      {/* Customer Data */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Dados do Cliente
        </h2>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Campos obrigatórios no formulário de agendamento
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { field: "Nome", required: true },
              { field: "Telefone", required: true },
              { field: "E-mail", required: true },
              { field: "Placa do veículo", required: false },
              { field: "Modelo do veículo", required: false },
              { field: "Observações", required: false },
            ].map((item) => (
              <div key={item.field} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-foreground">{item.field}</span>
                <Switch defaultChecked={item.required} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Termos e Condições
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Exigir aceite de termos</Label>
              <p className="text-sm text-muted-foreground">
                Cliente deve aceitar termos antes de agendar
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label>Texto dos termos</Label>
            <Textarea
              defaultValue="Ao agendar, você concorda com nossa política de cancelamento e confirma que as informações fornecidas são corretas."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button className="btn-gradient">Salvar Configurações</Button>
      </div>
    </div>
  );
}
