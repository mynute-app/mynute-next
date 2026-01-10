import { memo } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ServiceCheckboxListProps {
  services: any[];
  selectedServices: string[];
  onToggle: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export const ServiceCheckboxList = memo(
  ({
    services,
    selectedServices,
    onToggle,
    onSelectAll,
  }: ServiceCheckboxListProps) => {
    const validServices = services.filter(
      s => s && (s.id || s.id === 0) && s.name
    );
    const allSelected =
      validServices.length > 0 &&
      selectedServices.length === validServices.length;

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={onSelectAll}
          />
          <Label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            Selecionar Todos ({validServices.length})
          </Label>
        </div>

        <div className="border rounded-md">
          <div className="max-h-40 overflow-y-auto p-3">
            <div className="grid grid-cols-1 gap-2">
              {validServices.map(service => (
                <ServiceItem
                  key={service.id}
                  service={service}
                  isSelected={selectedServices.includes(service.id.toString())}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>

          <div className="p-2 bg-muted/20 border-t text-center">
            <span className="text-xs text-muted-foreground">
              {selectedServices.length} de {validServices.length} selecionados
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ServiceCheckboxList.displayName = "ServiceCheckboxList";

interface ServiceItemProps {
  service: any;
  isSelected: boolean;
  onToggle: (id: string, checked: boolean) => void;
}

const ServiceItem = ({ service, isSelected, onToggle }: ServiceItemProps) => (
  <div className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded border-b border-muted/30 last:border-b-0">
    <Checkbox
      id={`service-${service.id}`}
      checked={isSelected}
      onCheckedChange={checked =>
        onToggle(service.id.toString(), checked as boolean)
      }
    />
    <Label
      htmlFor={`service-${service.id}`}
      className="text-sm cursor-pointer flex-1 leading-none"
    >
      {service.name}
    </Label>
  </div>
);
