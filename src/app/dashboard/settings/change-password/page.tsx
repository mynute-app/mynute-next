import { ChangePasswordForm } from "@/app/dashboard/settings/change-password/_components/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações de Conta</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações de segurança
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
