import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { TfiLocationPin } from "react-icons/tfi";
import { useToast } from "@/hooks/use-toast";


interface Branch {
  id: number;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
}

interface AddressFieldProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  branch: Branch;
  index: number;
  onDelete: (branchId: number) => void;
}

export function AddressField({
  register,
  watch,
  branch,
  index,
  onDelete,
}: AddressFieldProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const hasChanges = [
    "street",
    "number",
    "complement",
    "neighborhood",
    "zip_code",
    "city",
    "state",
    "country",
  ].some(
    field =>
      watch(`branches.${index}.${field}`) !== branch[field as keyof Branch]
  );

  const handleSave = async () => {
    setIsSaving(true);

    const updatedData = {
      name: watch(`branches.${index}.name`),
      street: watch(`branches.${index}.street`),
      number: watch(`branches.${index}.number`),
      complement: watch(`branches.${index}.complement`),
      neighborhood: watch(`branches.${index}.neighborhood`),
      zip_code: watch(`branches.${index}.zip_code`),
      city: watch(`branches.${index}.city`),
      state: watch(`branches.${index}.state`),
      country: watch(`branches.${index}.country`),
    };

    try {
      const response = await fetch(`/api/address/${branch.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error(
          "❌ Erro ao atualizar filial:",
          response.status,
          responseData
        );

        toast({
          title: "Erro ao atualizar filial",
          description: "Ocorreu um erro ao tentar atualizar os dados.",
          variant: "destructive",
        });

        return;
      }

      console.log("✅ Filial atualizada com sucesso:", responseData);

      toast({
        title: "Filial atualizada!",
        description: "Os dados foram salvos com sucesso.",
      });
    } catch (error) {
      console.error("❌ Erro ao salvar alterações:", error);

      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/address/${branch.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir filial");
      }

      toast({
        title: "Filial excluída!",
        description: "A filial foi removida com sucesso.",
      });

      onDelete(branch.id); // Atualiza a lista de filiais no front
    } catch (error) {
      console.error("Erro ao excluir filial:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a filial.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false); // Fecha o modal após a ação
    }
  };

  return (
    <div>
      <Accordion type="single" collapsible>
        <AccordionItem value={`branch-${index}`}>
          <AccordionTrigger className="text-base font-medium flex items-center gap-3 px-2 py-2 hover:no-underline hover:bg-muted rounded-md transition">
            <div className="text-foreground flex justify-center items-center gap-3">
              <TfiLocationPin />
              {branch.name}
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="p-4 rounded-md bg-gray-50 border">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.zip_code`}>CEP</Label>
                  <Input
                    id={`branches.${index}.zip_code`}
                    placeholder="00000-000"
                    {...register(`branches.${index}.zip_code`)}
                    defaultValue={branch.zip_code || ""}
                    className="bg-white shadow"
                  />
                </div>

                <div className="col-span-6">
                  <Label htmlFor={`branches.${index}.street`}>Rua</Label>
                  <Input
                    id={`branches.${index}.street`}
                    placeholder="Rua"
                    {...register(`branches.${index}.street`)}
                    defaultValue={branch.street || ""}
                    className="bg-white shadow"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor={`branches.${index}.number`}>Número</Label>
                  <Input
                    id={`branches.${index}.number`}
                    placeholder="Número"
                    {...register(`branches.${index}.number`)}
                    defaultValue={branch.number || ""}
                    className="bg-white shadow"
                  />
                </div>

                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.complement`}>
                    Complemento
                  </Label>
                  <Input
                    id={`branches.${index}.complement`}
                    placeholder="Apt, sala, etc."
                    {...register(`branches.${index}.complement`)}
                    defaultValue={branch.complement || ""}
                    className="bg-white shadow"
                  />
                </div>


                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.neighborhood`}>
                    Bairro
                  </Label>
                  <Input
                    id={`branches.${index}.neighborhood`}
                    placeholder="Bairro"
                    {...register(`branches.${index}.neighborhood`)}
                    defaultValue={branch.neighborhood || ""}
                    className="bg-white shadow"
                  />
                </div>

                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.city`}>Cidade</Label>
                  <Input
                    id={`branches.${index}.city`}
                    placeholder="Cidade"
                    {...register(`branches.${index}.city`)}
                    defaultValue={branch.city || ""}
                    className="bg-white shadow"
                  />
                </div>

                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.state`}>Estado</Label>
                  <Input
                    id={`branches.${index}.state`}
                    placeholder="Estado"
                    {...register(`branches.${index}.state`)}
                    defaultValue={branch.state || ""}
                    className="bg-white shadow"
                  />
                </div>

                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.country`}>País</Label>
                  <Input
                    id={`branches.${index}.country`}
                    placeholder="País"
                    {...register(`branches.${index}.country`)}
                    defaultValue={branch.country || ""}
                    className="bg-white shadow"
                  />
                </div>

                {/* Botões de Ação */}
                <div className="col-span-12 flex justify-end gap-2 mt-4">
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-500 text-white hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    {isDeleting ? "Excluindo..." : "Excluir"}
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={`rounded-md px-4 py-2 ${
                      hasChanges
                        ? "bg-primary text-white hover:bg-blue-950"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
