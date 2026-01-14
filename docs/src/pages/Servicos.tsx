import { useState } from "react";
import { Search, Plus, Clock, DollarSign, Star, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ServiceDialog, Service } from "@/components/services/ServiceDialog";
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

const initialServices: Service[] = [
  { id: "1", name: "Lavagem Simples", description: "Lavagem externa completa com produtos de qualidade", price: 45, duration: 30, bufferTime: 15, category: "Lavagem", active: true, featured: false },
  { id: "2", name: "Lavagem Completa", description: "Lavagem externa e interna com aspiração e limpeza de painel", price: 80, duration: 60, bufferTime: 15, category: "Lavagem", active: true, featured: true },
  { id: "3", name: "Polimento", description: "Polimento completo para restaurar o brilho da pintura", price: 250, priceFrom: true, duration: 180, bufferTime: 30, category: "Polimento", active: true, featured: true },
  { id: "4", name: "Higienização Interna", description: "Higienização profunda de bancos, carpetes e forros", price: 150, duration: 120, bufferTime: 15, category: "Higienização", active: true, featured: false },
  { id: "5", name: "Cristalização", description: "Proteção de longa duração para a pintura", price: 400, duration: 240, bufferTime: 30, category: "Proteção", active: true, featured: true },
  { id: "6", name: "Lavagem + Cera", description: "Lavagem completa com aplicação de cera protetora", price: 120, duration: 90, bufferTime: 15, category: "Lavagem", active: true, featured: false },
  { id: "7", name: "Limpeza de Motor", description: "Limpeza e higienização do compartimento do motor", price: 80, duration: 45, bufferTime: 10, category: "Outros", active: false, featured: false },
];

const categories = ["Todos", "Lavagem", "Polimento", "Higienização", "Proteção", "Outros"];
const categoryOptions = ["Lavagem", "Polimento", "Higienização", "Proteção", "Outros"];

export default function Servicos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [services, setServices] = useState<Service[]>(initialServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateService = () => {
    setSelectedService(null);
    setDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
      setServiceToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveService = (serviceData: Omit<Service, "id"> & { id?: string }) => {
    if (serviceData.id) {
      // Edit existing
      setServices((prev) =>
        prev.map((s) => (s.id === serviceData.id ? { ...s, ...serviceData } as Service : s))
      );
    } else {
      // Create new
      const newService: Service = {
        ...serviceData,
        id: Date.now().toString(),
      };
      setServices((prev) => [...prev, newService]);
    }
  };

  const handleToggleActive = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, active: !s.active } : s))
    );
  };

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Serviços</h1>
          <p className="page-description">Gerencie os serviços oferecidos</p>
        </div>
        <Button className="btn-gradient" onClick={handleCreateService}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviço..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "whitespace-nowrap",
                  selectedCategory === cat && "bg-background shadow-sm"
                )}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className={cn(
              "bg-card rounded-xl border border-border shadow-sm overflow-hidden card-hover",
              !service.active && "opacity-60"
            )}
          >
            {/* Image Placeholder */}
            <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
              <div className="text-4xl opacity-50">🚗</div>
              {service.featured && (
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground border-0">
                  <Star className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {service.category}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm">
                  <DollarSign className="w-4 h-4 text-success" />
                  <span className="font-semibold text-foreground">
                    {service.priceFrom && "A partir de "}R$ {service.price}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} min</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={service.active} 
                    onCheckedChange={() => handleToggleActive(service.id)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {service.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(service)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Dialog */}
      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selectedService}
        onSave={handleSaveService}
        categories={categoryOptions}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço "{serviceToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
