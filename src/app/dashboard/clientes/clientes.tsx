"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
import { ClientDialog } from "@/components/clients/ClientDialog";
import { ClientsLoadingSkeleton } from "@/components/clients/clients-loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useCompanyClients } from "@/hooks/use-company-clients";
import type { CompanyClient } from "@/types/company-client";

const formatAddress = (client: CompanyClient) => {
  const line1 = [client.street, client.number].filter(Boolean).join(", ");
  const cityState = [client.city, client.state].filter(Boolean).join(" - ");
  const line2 = [client.neighborhood, cityState].filter(Boolean).join(" • ");
  const line3 = [client.country, client.zip_code].filter(Boolean).join(" • ");
  return [line1, line2, line3].filter(Boolean).join(" • ");
};

export const ClientesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<CompanyClient[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<
    CompanyClient | undefined
  >();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] =
    useState<CompanyClient | null>(null);
  const { data, isLoading, error, refetch } = useCompanyClients({
    page: 1,
    pageSize: 50,
  });

  useEffect(() => {
    if (data?.company_clients) {
      setClients(data.company_clients);
    }
  }, [data]);

  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter(client => {
      const fullName = `${client.name} ${client.surname}`.toLowerCase();
      const address = formatAddress(client).toLowerCase();
      return (
        fullName.includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term) ||
        address.includes(term)
      );
    });
  }, [clients, searchTerm]);

  const handleCreateClient = () => {
    setSelectedClient(undefined);
    setDialogOpen(true);
  };

  const handleEditClient = (client: CompanyClient) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  const handleDeleteClick = (client: CompanyClient) => {
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

  const handleCreatedClient = (client: CompanyClient) => {
    setClients(prev => [client, ...prev]);
    setDialogOpen(false);
    refetch();
  };

  const handleUpdatedClient = (client: CompanyClient) => {
    setClients(prev => prev.map(c => (c.id === client.id ? client : c)));
    setDialogOpen(false);
  };

  return (
    <div className="clients-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-6 pb-12 lg:pt-0">
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
                  placeholder="Buscar por nome, email, telefone ou endereço..."
                  className="pl-9 input-focus"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {isLoading ? (
              <ClientsLoadingSkeleton />
            ) : error ? (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <ErrorState
                  title="Erro ao carregar clientes"
                  description={error}
                  onRetry={refetch}
                />
              </div>
            ) : filteredClients.length === 0 ? (
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
            ) : (
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
                            {client.name} {client.surname}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Cliente
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">
                          {formatAddress(client) || "Endereço não informado"}
                        </span>
                      </div>
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
            )}
          </div>
        </div>
      </div>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
        onCreated={handleCreatedClient}
        onUpdated={handleUpdatedClient}
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
