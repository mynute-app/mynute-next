import { useState, useEffect } from "react";
import { Upload, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFrom?: boolean;
  duration: number;
  bufferTime: number;
  category: string;
  active: boolean;
  featured: boolean;
  image?: string;
}

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSave: (service: Omit<Service, "id"> & { id?: string }) => void;
  categories: string[];
}

const defaultService: Omit<Service, "id"> = {
  name: "",
  description: "",
  price: 0,
  priceFrom: false,
  duration: 30,
  bufferTime: 15,
  category: "",
  active: true,
  featured: false,
};

export function ServiceDialog({
  open,
  onOpenChange,
  service,
  onSave,
  categories,
}: ServiceDialogProps) {
  const [formData, setFormData] = useState<Omit<Service, "id"> & { id?: string }>(defaultService);
  const isEditing = !!service;

  useEffect(() => {
    if (service) {
      setFormData(service);
    } else {
      setFormData(defaultService);
    }
  }, [service, open]);

  const handleChange = (field: keyof Service, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {isEditing ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Imagem do Serviço</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload ou arraste uma imagem
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG até 5MB
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Ex: Corte de cabelo masculino"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Descreva o serviço..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleChange("duration", parseInt(e.target.value) || 0)}
                    min={5}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <div className="flex items-center gap-2 ml-auto">
                      <Switch
                        id="priceFrom"
                        checked={formData.priceFrom}
                        onCheckedChange={(checked) => handleChange("priceFrom", checked)}
                      />
                      <Label htmlFor="priceFrom" className="text-sm font-normal text-muted-foreground">
                        A partir de
                      </Label>
                    </div>
                  </div>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                    min={0}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bufferTime">Intervalo após (min)</Label>
                  <Select
                    value={formData.bufferTime.toString()}
                    onValueChange={(value) => handleChange("bufferTime", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sem intervalo</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Serviço Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Serviços inativos não aparecem na página pública
                    </p>
                  </div>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => handleChange("active", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-accent" />
                      Destaque
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Serviços em destaque aparecem primeiro
                    </p>
                  </div>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleChange("featured", checked)}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient">
              {isEditing ? "Salvar Alterações" : "Criar Serviço"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
