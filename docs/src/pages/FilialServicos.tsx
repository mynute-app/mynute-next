import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Mock data - catálogo global de serviços
const allServices = [
  { id: "1", name: "Corte de Cabelo", category: "Cabelo", price: 50, duration: 45 },
  { id: "2", name: "Barba", category: "Barba", price: 35, duration: 30 },
  { id: "3", name: "Corte + Barba", category: "Combos", price: 75, duration: 60 },
  { id: "4", name: "Coloração", category: "Cabelo", price: 120, duration: 90 },
  { id: "5", name: "Hidratação Capilar", category: "Tratamentos", price: 80, duration: 45 },
  { id: "6", name: "Manicure", category: "Unhas", price: 40, duration: 45 },
  { id: "7", name: "Pedicure", category: "Unhas", price: 50, duration: 60 },
  { id: "8", name: "Design de Sobrancelhas", category: "Estética", price: 30, duration: 20 },
];

// Mock - serviços ativos por filial
const branchServicesMap: Record<string, string[]> = {
  "1": ["1", "2", "3", "4", "5"],
  "2": ["1", "2", "3", "6", "7"],
  "3": ["1", "2", "8"],
};

// Mock - nome das filiais
const branchNames: Record<string, string> = {
  "1": "Unidade Centro",
  "2": "Unidade Shopping",
  "3": "Unidade Zona Sul",
};

const FilialServicos = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [enabledServices, setEnabledServices] = useState<string[]>(
    branchServicesMap[branchId || "1"] || []
  );

  const branchName = branchNames[branchId || "1"] || "Filial";

  const filteredServices = allServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(allServices.map(s => s.category))];

  const toggleService = (serviceId: string) => {
    setEnabledServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const enableAll = () => {
    setEnabledServices(allServices.map(s => s.id));
  };

  const disableAll = () => {
    setEnabledServices([]);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/filiais">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="page-title">Serviços da Filial</h1>
          <p className="text-muted-foreground">{branchName}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={enableAll}>
            <Check className="w-4 h-4 mr-2" />
            Ativar Todos
          </Button>
          <Button variant="outline" onClick={disableAll}>
            <X className="w-4 h-4 mr-2" />
            Desativar Todos
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="bg-card rounded-lg border px-4 py-3">
          <span className="text-2xl font-bold text-primary">{enabledServices.length}</span>
          <span className="text-muted-foreground ml-2">ativos</span>
        </div>
        <div className="bg-card rounded-lg border px-4 py-3">
          <span className="text-2xl font-bold">{allServices.length - enabledServices.length}</span>
          <span className="text-muted-foreground ml-2">inativos</span>
        </div>
      </div>

      {/* Services by Category */}
      {categories.map(category => {
        const categoryServices = filteredServices.filter(s => s.category === category);
        if (categoryServices.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <h2 className="font-semibold text-lg">{category}</h2>
            <div className="grid gap-3">
              {categoryServices.map(service => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-card rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={enabledServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>R$ {service.price.toFixed(2)}</span>
                        <span>•</span>
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={enabledServices.includes(service.id) ? "default" : "secondary"}>
                    {enabledServices.includes(service.id) ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button className="btn-gradient">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default FilialServicos;
