import { Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image?: string;
  category?: string;
}

interface ServiceSelectionProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
}

export const ServiceSelection = ({ services, selectedServiceId, onSelect }: ServiceSelectionProps) => {
  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || "Serviços";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Escolha o serviço</h2>
        <p className="text-sm text-muted-foreground mt-1">Selecione o serviço que deseja agendar</p>
      </div>

      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category} className="space-y-3">
          {Object.keys(groupedServices).length > 1 && (
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {category}
            </h3>
          )}
          
          <div className="grid gap-3">
            {categoryServices.map((service) => {
              const isSelected = selectedServiceId === service.id;
              
              return (
                <button
                  key={service.id}
                  onClick={() => onSelect(service.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isSelected 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex gap-4">
                    {service.image && (
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground">{service.name}</h4>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                        <span className="font-semibold text-foreground">
                          R$ {service.price.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
