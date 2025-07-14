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
import { Trash2 } from "lucide-react";
import { TfiLocationPin } from "react-icons/tfi";
import { useAddressField } from "@/hooks/branch/use-address-field";
import { useBranchImage } from "@/hooks/branch/use-branch-image";
import { useGetBranch } from "@/hooks/branch/use-get-branch";
import { ImageField } from "@/components/custom/image-field";
import { Separator } from "@/components/ui/separator";

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
  // Hook para buscar dados completos da filial
  const {
    data: branchData,
    isLoading: isLoadingBranch,
    refetch: refetchBranch,
  } = useGetBranch({
    branchId: branch.id,
    enabled: true,
  });

  // Hook para funcionalidades gerais (salvar, deletar, detectar mudanças)
  const { isSaving, isDeleting, hasChanges, handleSave, handleDelete } =
    useAddressField(branch, index, onDelete, watch);

  // Hook para upload/delete de imagens (sem passar currentImage para não sobrescrever)
  const { isUploading, isRemoving, handleImageChange, handleRemoveImage } =
    useBranchImage({
      branchId: branch.id,
      currentImage: undefined, // Não passa imagem inicial
      imageType: "profile", // Especifica que é imagem de profile
      onSuccess: refetchBranch, // Callback para atualizar dados após upload/delete
    });

  // Imagem da filial vinda da API (tem prioridade para exibição)
  const imagePreview = branchData?.design?.images?.profile?.url || null;

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
              <div className="grid gap-4 mb-4 w-96">
                <ImageField
                  label="Imagem da Filial"
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  onRemoveImage={handleRemoveImage}
                  isUploading={isUploading || isLoadingBranch}
                  isRemoving={isRemoving}
                  placeholder={
                    isLoadingBranch
                      ? "Carregando imagem..."
                      : "Adicionar imagem"
                  }
                />
              </div>
              <Separator className="mb-4" />
              <div className="grid grid-cols-12 gap-4">
                {/* Campo Nome da Filial */}
                <div className="col-span-12">
                  <Label htmlFor={`branches.${index}.name`}>
                    Nome da Filial
                  </Label>
                  <Input
                    id={`branches.${index}.name`}
                    placeholder="Nome da filial"
                    {...register(`branches.${index}.name`)}
                    defaultValue={branch.name || ""}
                    className="bg-white shadow"
                  />
                </div>

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
