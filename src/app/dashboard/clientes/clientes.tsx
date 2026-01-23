"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Edit,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientDialog, type Client } from "@/components/clients/ClientDialog";
import { cn } from "@/lib/utils";

const initialClients: Client[] = [
  {
    id: "1",
    name: "Família Silva",
    phone: "(11) 99999-1234",
    email: "silva@email.com",
    address: "Av. Paulista, 1000",
    company: "Silva & Filhos",
    document: "123.456.789-00",
    notes: "Prefere atendimento no período da manhã.",
    appointments: [
      {
        id: "a1",
        date: "2024-10-12",
        service: "Consultoria Inicial",
        professional: "Ana",
        status: "Concluído",
      },
      {
        id: "a2",
        date: "2024-11-03",
        service: "Retorno",
        professional: "Ana",
        status: "Agendado",
      },
    ],
    tags: ["VIP", "Recorrente"],
  },
  {
    id: "2",
    name: "Família Santos",
    phone: "(11) 98888-5678",
    email: "santos@email.com",
    company: "Santos LTDA",
    document: "987.654.321-00",
    notes: "Cliente novo, primeira visita.",
    appointments: [
      {
        id: "a3",
        date: "2024-09-15",
        service: "Onboarding",
        professional: "Lucas",
        status: "Concluído",
      },
    ],
    tags: ["Novo"],
  },
  {
    id: "3",
    name: "Família Oliveira",
    phone: "(11) 97777-9012",
    email: "oliveira@email.com",
    address: "Rua Oscar Freire, 500",
    company: "Oliveira Tech",
    document: "111.222.333-44",
    notes: "Gosta de atendimento rápido.",
    appointments: [],
    tags: ["VIP", "Empresa"],
  },
];

const tagColors: Record<string, string> = {
  VIP: "bg-accent/10 text-accent border-accent/20",
  Recorrente: "bg-primary/10 text-primary border-primary/20",
  Novo: "bg-success/10 text-success border-success/20",
  Empresa: "bg-warning/10 text-warning border-warning/20",
  Premium: "bg-accent/10 text-accent border-accent/20",
};

export const ClientesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.company || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateClient = () => {
    setSelectedClient(undefined);
    setDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleSaveClient = (data: Partial<Client>) => {
    if (selectedClient) {
      setClients(
        clients.map(c => (c.id === selectedClient.id ? { ...c, ...data } : c)),
      );
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address,
        company: data.company,
        document: data.document,
        notes: data.notes,
        appointments: data.appointments || [],
        tags: data.tags || [],
      };
      setClients([...clients, newClient]);
    }
    setDialogOpen(false);
  };

  return (
    <div className="clients-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-6 pt-12 lg:pt-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="page-header mb-0">
                <h1 className="page-title">Clientes</h1>
                <p className="page-description">
                  Gerencie seus clientes e histórico de atendimentos
                </p>
              </div>
              <Button className="btn-gradient" onClick={handleCreateClient}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  className="pl-9 input-focus"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm card-hover"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {client.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {client.company ? client.company : "Cliente"} •{" "}
                          {client.appointments.length} agendamento
                          {client.appointments.length !== 1 && "s"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Cliente
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(client)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{client.email}</span>
                    </div>
                    {client.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarCheck className="h-4 w-4" />
                      <span>
                        {client.appointments.length > 0
                          ? `Último: ${client.appointments[client.appointments.length - 1].date}`
                          : "Sem agendamentos"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {client.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn(
                          "text-xs",
                          tagColors[tag] || "bg-muted text-muted-foreground",
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEditClient(client)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">
                  Nenhum cliente encontrado
                </h3>
                <p className="mb-4 text-muted-foreground">
                  {searchTerm
                    ? "Tente buscar com outros termos"
                    : "Comece cadastrando seu primeiro cliente"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateClient} className="btn-gradient">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cliente
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
        onSave={handleSaveClient}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{clientToDelete?.name}"? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
