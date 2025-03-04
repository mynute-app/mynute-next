import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessInfoFieldsProps {
  register: any;
  error?: string;
  name?: string;
  taxId?: string;
  loading: boolean;
}

export function BusinessInfoFields({
  register,
  error,
  name,
  taxId,
  loading,
}: BusinessInfoFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Nome da empresa */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ) : (
          <>
            <Label htmlFor="businessName">Nome da Empresa</Label>
            <Input
              id="businessName"
              placeholder="Nome da empresa"
              {...register("businessName", {
                required: "O nome da empresa é obrigatório.",
              })}
              defaultValue={name}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </>
        )}
      </div>

      {/* Tax ID (Apenas leitura) */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ) : (
          <>
            <Label htmlFor="taxId">CNPJ/CPF</Label>
            <Input
              id="taxId"
              placeholder="CNPJ da empresa"
              value={taxId || ""}
              readOnly
              className="bg-gray-200 text-gray-500 cursor-not-allowed opacity-70 border-none focus:ring-0"
            />
          </>
        )}
      </div>
    </div>
  );
}
