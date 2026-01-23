"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarCheck, Plus, Tag, User, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export interface AppointmentHistory {
  id: string;
  date: string;
  service: string;
  professional?: string;
  status?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  company?: string;
  document?: string;
  notes?: string;
  appointments: AppointmentHistory[];
  tags: string[];
}

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSave: (data: Partial<Client>) => void;
}

const availableTags = ["VIP", "Recorrente", "Novo", "Premium", "Empresa"];

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSave,
}: ClientDialogProps) {
  const isEditing = !!client;

  const [formData, setFormData] = useState<Partial<Client>>({
    name: "",
    phone: "",
    email: "",
    address: "",
    company: "",
    document: "",
    notes: "",
    appointments: [],
    tags: [],
  });

  const [newAppointment, setNewAppointment] = useState({
    date: "",
    service: "",
    professional: "",
    status: "Agendado",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        phone: client.phone || "",
        email: client.email || "",
        address: client.address || "",
        company: client.company || "",
        document: client.document || "",
        notes: client.notes || "",
        appointments: client.appointments || [],
        tags: client.tags || [],
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        company: "",
        document: "",
        notes: "",
        appointments: [],
        tags: [],
      });
    }
    setNewAppointment({
      date: "",
      service: "",
      professional: "",
      status: "Agendado",
    });
  }, [client, open]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAppointment = () => {
    if (!newAppointment.date || !newAppointment.service) return;
    const appointment: AppointmentHistory = {
      id: Date.now().toString(),
      date: newAppointment.date,
      service: newAppointment.service,
      professional: newAppointment.professional,
      status: newAppointment.status,
    };
    setFormData(prev => ({
      ...prev,
      appointments: [...(prev.appointments || []), appointment],
    }));
    setNewAppointment({
      date: "",
      service: "",
      professional: "",
      status: "Agendado",
    });
  };

  const handleRemoveAppointment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      appointments: (prev.appointments || []).filter(item => item.id !== id),
    }));
  };

  const handleToggleTag = (tag: string) => {
    setFormData(prev => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(item => item !== tag) };
      }
      return { ...prev, tags: [...currentTags, tag] };
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] min-h-0 max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do cliente"
              : "Preencha os dados para cadastrar um novo cliente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="flex-1 min-h-0 h-full px-6">
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <User className="h-4 w-4" />
                  Dados Principais
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      value={formData.name || ""}
                      onChange={event =>
                        handleChange("name", event.target.value)
                      }
                      placeholder="Nome do cliente"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone *</Label>
                    <Input
                      value={formData.phone || ""}
                      onChange={event =>
                        handleChange("phone", event.target.value)
                      }
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={formData.email || ""}
                      onChange={event =>
                        handleChange("email", event.target.value)
                      }
                      placeholder="cliente@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Input
                      value={formData.company || ""}
                      onChange={event =>
                        handleChange("company", event.target.value)
                      }
                      placeholder="Nome da empresa (opcional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Documento</Label>
                    <Input
                      value={formData.document || ""}
                      onChange={event =>
                        handleChange("document", event.target.value)
                      }
                      placeholder="CPF/CNPJ (opcional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input
                      value={formData.address || ""}
                      onChange={event =>
                        handleChange("address", event.target.value)
                      }
                      placeholder="Endereço completo"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={formData.notes || ""}
                      onChange={event =>
                        handleChange("notes", event.target.value)
                      }
                      placeholder="Preferências, alergias, detalhes importantes..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={
                        (formData.tags || []).includes(tag)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => handleToggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" />
                  Histórico de Agendamentos
                </h3>

                {(formData.appointments || []).length > 0 && (
                  <div className="space-y-2">
                    {(formData.appointments || []).map(appointment => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                      >
                        <div>
                          <p className="font-medium">{appointment.service}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date}
                            {appointment.professional
                              ? ` • ${appointment.professional}`
                              : ""}
                            {appointment.status
                              ? ` • ${appointment.status}`
                              : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveAppointment(appointment.id)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <Input
                    type="date"
                    placeholder="Data"
                    value={newAppointment.date}
                    onChange={event =>
                      setNewAppointment({
                        ...newAppointment,
                        date: event.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Serviço"
                    value={newAppointment.service}
                    onChange={event =>
                      setNewAppointment({
                        ...newAppointment,
                        service: event.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Profissional"
                    value={newAppointment.professional}
                    onChange={event =>
                      setNewAppointment({
                        ...newAppointment,
                        professional: event.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Status"
                    value={newAppointment.status}
                    onChange={event =>
                      setNewAppointment({
                        ...newAppointment,
                        status: event.target.value,
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAppointment}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient">
              {isEditing ? "Salvar Alterações" : "Criar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
