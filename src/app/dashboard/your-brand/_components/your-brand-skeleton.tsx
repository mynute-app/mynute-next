import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function YourBrandSkeleton() {
  return (
    <div className="p-4 max-h-screen h-screen overflow-y-auto flex gap-4 flex-col md:flex-row">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full md:w-1/2 py-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" /> {/* "Sua Marca" */}
            <Skeleton className="h-4 w-64" /> {/* Nome da empresa e ID */}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Formulário */}
        <div className="space-y-6">
          {/* Banner Upload */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Label */}
            <Skeleton className="h-32 w-full rounded-md" /> {/* Upload área */}
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" /> {/* Label */}
            <Skeleton className="h-32 w-full rounded-md" /> {/* Upload área */}
          </div>

          {/* Background Upload */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" /> {/* Label */}
            <Skeleton className="h-32 w-full rounded-md" /> {/* Upload área */}
          </div>

          {/* Color Settings */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-28" /> {/* "Configurações de Cor" */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-18" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Botão Salvar */}
          <div className="pt-6">
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>
      </div>

      {/* Lado Direito - Preview */}
      <div className="w-full md:w-1/2 rounded-md shadow-sm">
        <div className="space-y-4">
          {/* Preview Principal */}
          <Skeleton className="w-full h-[500px] rounded-md" />

          {/* Detalhes do Design */}
          <div className="p-4 space-y-4">
            <Skeleton className="h-5 w-48" /> {/* "Detalhes do Design Atual" */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
