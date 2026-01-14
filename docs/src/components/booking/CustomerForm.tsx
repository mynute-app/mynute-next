import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom field types for white-label flexibility
export interface CustomField {
  id: string;
  label: string;
  type: "text" | "select" | "tel" | "email";
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select type
}

// Example business type configurations
export const businessTypeFields: Record<string, CustomField[]> = {
  carwash: [
    { id: "vehiclePlate", label: "Placa do Veículo", type: "text", placeholder: "ABC-1234", required: true },
    { id: "vehicleModel", label: "Modelo do Veículo", type: "text", placeholder: "Ex: Honda Civic" },
    { id: "vehicleColor", label: "Cor do Veículo", type: "select", options: ["Branco", "Preto", "Prata", "Vermelho", "Azul", "Cinza", "Outro"] },
  ],
  petshop: [
    { id: "petName", label: "Nome do Pet", type: "text", placeholder: "Nome do seu pet", required: true },
    { id: "petBreed", label: "Raça", type: "text", placeholder: "Ex: Golden Retriever" },
    { id: "petSize", label: "Porte", type: "select", options: ["Pequeno", "Médio", "Grande"] },
    { id: "petAge", label: "Idade (anos)", type: "text", placeholder: "Ex: 3" },
  ],
  salon: [
    { id: "hairType", label: "Tipo de Cabelo", type: "select", options: ["Liso", "Ondulado", "Cacheado", "Crespo"] },
    { id: "referencePhoto", label: "Tem foto de referência?", type: "select", options: ["Sim, vou levar", "Não"] },
  ],
  tattoo: [
    { id: "bodyPart", label: "Parte do Corpo", type: "text", placeholder: "Ex: Braço direito" },
    { id: "tattooSize", label: "Tamanho Aproximado", type: "select", options: ["Pequeno (até 5cm)", "Médio (5-15cm)", "Grande (15-30cm)", "Extra Grande"] },
    { id: "hasDesign", label: "Já tem um design?", type: "select", options: ["Sim", "Preciso de ajuda", "Quero criar junto"] },
    { id: "firstTattoo", label: "É sua primeira tattoo?", type: "select", options: ["Sim", "Não"] },
  ],
  medical: [
    { id: "birthDate", label: "Data de Nascimento", type: "text", placeholder: "DD/MM/AAAA" },
    { id: "healthPlan", label: "Convênio", type: "text", placeholder: "Nome do convênio (se houver)" },
    { id: "healthPlanNumber", label: "Número da Carteirinha", type: "text", placeholder: "Número do convênio" },
  ],
  dental: [
    { id: "birthDate", label: "Data de Nascimento", type: "text", placeholder: "DD/MM/AAAA" },
    { id: "dentalPlan", label: "Convênio Odontológico", type: "text", placeholder: "Nome do convênio" },
    { id: "mainComplaint", label: "Principal Queixa", type: "text", placeholder: "Descreva brevemente o motivo da consulta" },
  ],
  generic: [], // No extra fields
};

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  notes: string;
  customFields?: Record<string, string>;
}

interface CustomerFormProps {
  data: CustomerData;
  onChange: (data: CustomerData) => void;
  errors?: Partial<Record<keyof CustomerData, string>> & Record<string, string>;
  businessType?: keyof typeof businessTypeFields;
}

export const CustomerForm = ({ 
  data, 
  onChange, 
  errors, 
  businessType = "carwash" // Default for demo, would come from business config
}: CustomerFormProps) => {
  const customFields = businessTypeFields[businessType] || [];

  const handleChange = (field: keyof CustomerData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    onChange({
      ...data,
      customFields: {
        ...data.customFields,
        [fieldId]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Seus dados</h2>
        <p className="text-sm text-muted-foreground mt-1">Preencha seus dados para confirmar o agendamento</p>
      </div>

      <div className="space-y-4">
        {/* Standard Fields */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            placeholder="Digite seu nome"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="input-focus"
          />
          {errors?.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="input-focus"
          />
          {errors?.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="input-focus"
          />
          {errors?.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Custom Fields Based on Business Type */}
        {customFields.length > 0 && (
          <div className="pt-4 border-t border-border space-y-4">
            <p className="text-sm font-medium text-foreground">
              Informações adicionais
            </p>
            {customFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label} {field.required && "*"}
                </Label>
                {field.type === "select" && field.options ? (
                  <Select
                    value={data.customFields?.[field.id] || ""}
                    onValueChange={(value) => handleCustomFieldChange(field.id, value)}
                  >
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={data.customFields?.[field.id] || ""}
                    onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                    className="input-focus"
                  />
                )}
                {errors?.[field.id] && (
                  <p className="text-sm text-destructive">{errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            placeholder="Alguma informação adicional? (opcional)"
            value={data.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={3}
            className="input-focus resize-none"
          />
        </div>
      </div>
    </div>
  );
};
