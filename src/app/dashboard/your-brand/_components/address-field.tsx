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
  onDelete: (branchId: number) => void; // Nova função para deletar a filial
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
      const response = await fetch(`/api/branches/${branch.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar filial");
      }

      alert("Filial atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      alert("Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir a filial "${branch.name}"?`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/branches/${branch.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir filial");
      }

      alert("Filial excluída com sucesso!");
      onDelete(branch.id); // Remove a filial da UI
    } catch (error) {
      console.error("Erro ao excluir filial:", error);
      alert("Erro ao excluir filial");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="font-bold text-lg">Endereço</div>
      <Accordion type="single" collapsible>
        <AccordionItem value={`branch-${index}`}>
          <AccordionTrigger className="text-base font-light ">
            {branch.name}
          </AccordionTrigger>

          <AccordionContent>
            <div className="p-4 rounded-md">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <Label htmlFor={`branches.${index}.street`}>Rua</Label>
                  <Input
                    id={`branches.${index}.street`}
                    placeholder="Rua"
                    {...register(`branches.${index}.street`)}
                    defaultValue={branch.street || ""}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor={`branches.${index}.number`}>Número</Label>
                  <Input
                    id={`branches.${index}.number`}
                    placeholder="Número"
                    {...register(`branches.${index}.number`)}
                    defaultValue={branch.number || ""}
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
                  />
                </div>

                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.zip_code`}>CEP</Label>
                  <Input
                    id={`branches.${index}.zip_code`}
                    placeholder="00000-000"
                    {...register(`branches.${index}.zip_code`)}
                    defaultValue={branch.zip_code || ""}
                  />
                </div>

                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.city`}>Cidade</Label>
                  <Input
                    id={`branches.${index}.city`}
                    placeholder="Cidade"
                    {...register(`branches.${index}.city`)}
                    defaultValue={branch.city || ""}
                  />
                </div>

                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.state`}>Estado</Label>
                  <Input
                    id={`branches.${index}.state`}
                    placeholder="Estado"
                    {...register(`branches.${index}.state`)}
                    defaultValue={branch.state || ""}
                  />
                </div>

                <div className="col-span-4">
                  <Label htmlFor={`branches.${index}.country`}>País</Label>
                  <Input
                    id={`branches.${index}.country`}
                    placeholder="País"
                    {...register(`branches.${index}.country`)}
                    defaultValue={branch.country || ""}
                  />
                </div>

                {/* Botões de Ação */}
                <div className="col-span-12 flex justify-end gap-2 mt-4">
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    {isDeleting ? "Excluindo..." : "Excluir"}
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={`rounded-md px-4 py-2 ${
                      hasChanges
                        ? "bg-blue-600 text-white hover:bg-blue-700"
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
