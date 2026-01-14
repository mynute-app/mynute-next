import { Clock, DollarSign, Calendar, AlertCircle, Plus } from "lucide-react";
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

export default function ConfigServicos() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Configuração de Serviços</h1>
        <p className="page-description">
          Configure as regras gerais e padrões para serviços
        </p>
      </div>

      {/* Default Service Settings */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Configurações Padrão de Tempo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Intervalo entre serviços (buffer)</Label>
            <Select defaultValue="15">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sem intervalo</SelectItem>
                <SelectItem value="10">10 minutos</SelectItem>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Tempo de preparação/limpeza entre atendimentos
            </p>
          </div>
          <div className="space-y-2">
            <Label>Tamanho do slot</Label>
            <Select defaultValue="15">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Intervalos de horário na agenda
            </p>
          </div>
          <div className="space-y-2">
            <Label>Duração mínima</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-success" />
          Regras de Preço
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Permitir "a partir de"</Label>
              <p className="text-sm text-muted-foreground">
                Permite definir preços como "a partir de R$ XX"
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Mostrar preços na página pública</Label>
              <p className="text-sm text-muted-foreground">
                Exibe valores na página de agendamento
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Permitir pagamento online</Label>
              <p className="text-sm text-muted-foreground">
                Habilita pagamento/sinal durante agendamento
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Categorias de Serviço
          </h2>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
        <div className="space-y-3">
          {["Lavagem", "Polimento", "Higienização", "Proteção", "Outros"].map((cat) => (
            <div
              key={cat}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <span className="font-medium text-foreground">{cat}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-warning" />
          Política de Cancelamento
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Permitir cancelamento até</Label>
              <Select defaultValue="2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora antes</SelectItem>
                  <SelectItem value="2">2 horas antes</SelectItem>
                  <SelectItem value="6">6 horas antes</SelectItem>
                  <SelectItem value="24">24 horas antes</SelectItem>
                  <SelectItem value="48">48 horas antes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permitir reagendamento até</Label>
              <Select defaultValue="2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora antes</SelectItem>
                  <SelectItem value="2">2 horas antes</SelectItem>
                  <SelectItem value="6">6 horas antes</SelectItem>
                  <SelectItem value="24">24 horas antes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mensagem de política</Label>
            <Textarea
              defaultValue="Cancelamentos devem ser feitos com no mínimo 2 horas de antecedência. Reagendamentos são permitidos uma única vez por agendamento."
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
