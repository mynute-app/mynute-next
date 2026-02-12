import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { LoginFormSwitcher } from "@/app/auth/employee/_components/login-form-switcher";
import { getTenantCompanyForAuthPage } from "@/lib/tenant-auth-page";

export default async function TenantLoginPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const session = await auth();
  if (session?.user) {
    redirect(`/${tenant}/dashboard`);
  }

  const { company, errorComponent } = await getTenantCompanyForAuthPage(tenant);

  if (errorComponent) {
    return errorComponent;
  }

  if (!company) {
    return null;
  }

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <div className="flex min-h-[100dvh] flex-col gap-4 p-4 py-8 sm:p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center py-4">
          <div className="w-full max-w-xs space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                Acesse sua conta da {company.trading_name || company.legal_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Ambiente exclusivo para funcionarios.
              </p>
            </div>

            <LoginFormSwitcher />
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
