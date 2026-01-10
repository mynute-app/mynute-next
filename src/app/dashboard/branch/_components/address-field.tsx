import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { Trash2, MapPin, Save } from "lucide-react";
import { useAddressField } from "@/hooks/branch/use-address-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  if (!branch || !branch.id) {
    console.warn("AddressField: branch ou branch.id está undefined", {
      branch,
      index,
    });
    return null;
  }

  const { isSaving, isDeleting, hasChanges, handleSave, handleDelete } =
    useAddressField(branch, index, onDelete, watch);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Endereço da Filial
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Nome da Filial */}
          <div>
            <Label
              htmlFor={`branches.${index}.name`}
              className="text-sm font-medium"
            >
              Nome da Filial
            </Label>
            <Input
              id={`branches.${index}.name`}
              placeholder="Nome da filial"
              {...register(`branches.${index}.name`)}
              defaultValue={branch.name || ""}
              className="mt-1.5"
            />
          </div>

          {/* Seção: CEP e Localização */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Localização
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor={`branches.${index}.zip_code`}
                  className="text-sm"
                >
                  CEP
                </Label>
                <Input
                  id={`branches.${index}.zip_code`}
                  placeholder="00000-000"
                  {...register(`branches.${index}.zip_code`)}
                  defaultValue={branch.zip_code || ""}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor={`branches.${index}.city`} className="text-sm">
                  Cidade
                </Label>
                <Input
                  id={`branches.${index}.city`}
                  placeholder="Cidade"
                  {...register(`branches.${index}.city`)}
                  defaultValue={branch.city || ""}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor={`branches.${index}.state`} className="text-sm">
                  Estado
                </Label>
                <Input
                  id={`branches.${index}.state`}
                  placeholder="Estado"
                  {...register(`branches.${index}.state`)}
                  defaultValue={branch.state || ""}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Seção: Endereço Completo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Endereço Completo
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <Label
                    htmlFor={`branches.${index}.street`}
                    className="text-sm"
                  >
                    Rua
                  </Label>
                  <Input
                    id={`branches.${index}.street`}
                    placeholder="Nome da rua"
                    {...register(`branches.${index}.street`)}
                    defaultValue={branch.street || ""}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`branches.${index}.number`}
                    className="text-sm"
                  >
                    Número
                  </Label>
                  <Input
                    id={`branches.${index}.number`}
                    placeholder="Nº"
                    {...register(`branches.${index}.number`)}
                    defaultValue={branch.number || ""}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor={`branches.${index}.complement`}
                    className="text-sm"
                  >
                    Complemento
                  </Label>
                  <Input
                    id={`branches.${index}.complement`}
                    placeholder="Apt, sala, etc. (opcional)"
                    {...register(`branches.${index}.complement`)}
                    defaultValue={branch.complement || ""}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`branches.${index}.neighborhood`}
                    className="text-sm"
                  >
                    Bairro
                  </Label>
                  <Input
                    id={`branches.${index}.neighborhood`}
                    placeholder="Bairro"
                    {...register(`branches.${index}.neighborhood`)}
                    defaultValue={branch.neighborhood || ""}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`branches.${index}.country`}
                    className="text-sm"
                  >
                    País
                  </Label>
                  <Input
                    id={`branches.${index}.country`}
                    placeholder="País"
                    {...register(`branches.${index}.country`)}
                    defaultValue={branch.country || ""}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Excluindo..." : "Excluir Filial"}
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
