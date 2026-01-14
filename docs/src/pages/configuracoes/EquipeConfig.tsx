import { Clock, Users, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ConfigEquipe() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Configuração de Equipe</h1>
        <p className="page-description">
          Configure horários, capacidade e regras da equipe
        </p>
      </div>

      {/* Working Hours */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Horário de Funcionamento Padrão
        </h2>
        <div className="space-y-4">
          {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map(
            (day, index) => (
              <div
                key={day}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
              >
                <div className="w-24">
                  <span className="font-medium text-foreground">{day}</span>
                </div>
                <Switch defaultChecked={index < 6} />
                <div className="flex items-center gap-2 flex-1">
                  <Select defaultValue="08:00" disabled={index === 6}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => i + 6).map((h) => (
                        <SelectItem key={h} value={`${h.toString().padStart(2, "0")}:00`}>
                          {h.toString().padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">até</span>
                  <Select defaultValue="18:00" disabled={index === 6}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => i + 10).map((h) => (
                        <SelectItem key={h} value={`${h.toString().padStart(2, "0")}:00`}>
                          {h.toString().padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Capacity Settings */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Capacidade e Alocação
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Permitir atendimentos simultâneos</Label>
              <p className="text-sm text-muted-foreground">
                Um profissional pode atender mais de um cliente por vez
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-alocação de profissional</Label>
              <p className="text-sm text-muted-foreground">
                Sistema escolhe automaticamente o profissional disponível
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Cliente pode escolher profissional</Label>
              <p className="text-sm text-muted-foreground">
                Permite seleção de profissional na página de agendamento
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Balanceamento de carga</Label>
              <p className="text-sm text-muted-foreground">
                Distribui agendamentos igualmente entre a equipe
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Time Off */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Folgas e Feriados
          </h2>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Folga
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Ano Novo</p>
              <p className="text-sm text-muted-foreground">01/01/2026 - Todos</p>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              Remover
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Carnaval</p>
              <p className="text-sm text-muted-foreground">16/02/2026 a 17/02/2026 - Todos</p>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              Remover
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Férias - Carlos</p>
              <p className="text-sm text-muted-foreground">01/03/2026 a 15/03/2026 - Carlos</p>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              Remover
            </Button>
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
