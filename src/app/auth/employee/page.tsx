import { LoginFormEmployee } from "../_components/form-employee";
import { useSubdomainValidation } from "@/hooks/use-subdomain-validation";

export default async function LoginPage() {
  const { company, errorComponent } = await useSubdomainValidation();

  if (errorComponent) {
    return errorComponent;
  }

  if (!company) {
    return null;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                Acesse sua conta da {company.trading_name || company.legal_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Ambiente exclusivo para funcionários.
              </p>
            </div>

            <LoginFormEmployee provider="employee-login" />
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <img
          src={company.design?.images?.background?.url || "/placeholder.svg"}
          alt="Imagem"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
