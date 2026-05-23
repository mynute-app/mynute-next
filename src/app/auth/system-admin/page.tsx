import { FormSystemAdmin } from "./_components/form-system-admin";
import { ShieldCheck } from "lucide-react";

export default function SystemAdminLoginPage() {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-10 py-8 min-h-[100dvh]">
        <div className="flex flex-1 items-center justify-center py-4">
          <div className="w-full max-w-xs space-y-4">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h2 className="text-lg font-semibold">Painel Administrativo</h2>
              <p className="text-sm text-muted-foreground">
                Acesso restrito a administradores da plataforma.
              </p>
            </div>

            <FormSystemAdmin />
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        <div className="relative z-10 text-center space-y-3 px-8">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Mynute</h1>
          <p className="text-muted-foreground text-sm max-w-xs">
            Painel de controle global da plataforma. Apenas administradores autorizados.
          </p>
        </div>
      </div>
    </div>
  );
}
