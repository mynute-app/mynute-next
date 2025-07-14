import { useState } from "react";
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
  image?: string;
}

export function useAddressField(
  branch: Branch,
  index: number,
  onDelete: (branchId: number) => void,
  watch: any
) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const hasChanges = [
    "name",
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

    try {
      // Salvar apenas os dados da filial (imagem já foi enviada automaticamente)
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

      const response = await fetch(`/api/branch/${branch.id}`, {
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
      const response = await fetch(`/api/branch/${branch.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir filial");
      }

      toast({
        title: "Filial excluída!",
        description: "A filial foi removida com sucesso.",
      });

      onDelete(branch.id);
    } catch (error) {
      console.error("Erro ao excluir filial:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a filial.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return {
    isSaving,
    isDeleting,
    isDialogOpen,
    setIsDialogOpen,
    hasChanges,
    handleSave,
    handleDelete,
  };
}
