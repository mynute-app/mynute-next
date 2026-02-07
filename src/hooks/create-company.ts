import { useState } from "react";
import { useRouter } from "next/navigation";
import { UseFormSetError } from "react-hook-form";
import { CompanyRegisterSchema } from "../../schema/company-register";
import { toast } from "./use-toast";
import { unmask, preparePhoneToSubmit } from "@/utils/format-cnpj";

export const useCreateCompany = () => {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const resolveTenantBaseDomain = () => {
    if (typeof window === "undefined") return "";

    const envBase = process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN?.trim();
    if (envBase) {
      return envBase.replace(/^https?:\/\//, "");
    }

    const host = window.location.host;
    const hostWithoutPort = host.split(":")[0];
    const port = host.includes(":") ? host.split(":")[1] : "";

    if (hostWithoutPort.endsWith("nip.io")) {
      const parts = hostWithoutPort.split(".");
      const baseParts = parts.slice(-5);
      const base = baseParts.join(".");
      return port ? `${base}:${port}` : base;
    }

    if (hostWithoutPort.endsWith("mynute.app")) {
      const base = "mynute.app";
      return port ? `${base}:${port}` : base;
    }

    return host;
  };

  const submit = async (
    data: CompanyRegisterSchema,
    setFormError: UseFormSetError<CompanyRegisterSchema>,
  ) => {
    setLoading(true);
    setSubmitError(null);

    try {
      const cleanData = {
        ...data,
        tax_id: unmask(data.tax_id),
        owner_phone: preparePhoneToSubmit(data.owner_phone),
      };

      const url = "/api/company";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      const text = await response.text();

      let errorMessage = text;

      try {
        const json = JSON.parse(text);
        errorMessage = json?.backendResponse || json?.message || text;
      } catch {}

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      const result = JSON.parse(text);
      const subdomain = cleanData.start_subdomain?.trim();

      if (subdomain) {
        const baseDomain = resolveTenantBaseDomain();
        const protocol = window.location.protocol;
        const redirectUrl = `${protocol}//${subdomain}.${baseDomain}/auth/employee`;

        toast({
          title: "Empresa cadastrada com sucesso!",
          description: "Redirecionando para o login...",
        });

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        toast({
          title: "Empresa cadastrada com sucesso!",
          description: "Sua empresa foi criada com sucesso.",
        });
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || String(err);

      // Traduzir erros comuns
      let translatedMessage = errorMessage;
      let errorField: keyof CompanyRegisterSchema | null = null;

      // Detectar constraint violations
      if (errorMessage.includes("idx_public_companies_trade_name")) {
        translatedMessage = "Já existe uma empresa com esse nome fantasia.";
        errorField = "trading_name";
      } else if (
        errorMessage.includes("idx_public_companies_tax_id") ||
        errorMessage.includes("uni_companies_tax_id")
      ) {
        translatedMessage = "Já existe uma empresa com esse CNPJ.";
        errorField = "tax_id";
      } else if (
        errorMessage.includes("idx_employees_email") ||
        errorMessage.includes("uni_employees_email")
      ) {
        translatedMessage = "Já existe uma conta com esse e-mail.";
        errorField = "owner_email";
      } else if (
        errorMessage.includes("idx_employees_phone") ||
        errorMessage.includes("uni_employees_phone")
      ) {
        translatedMessage = "Já existe uma conta com esse telefone.";
        errorField = "owner_phone";
      } else if (
        errorMessage.includes("subdomain") &&
        errorMessage.includes("already exists")
      ) {
        translatedMessage = "Este subdomínio já está em uso. Escolha outro.";
        errorField = "start_subdomain";
      } else if (errorMessage.includes("duplicate key")) {
        translatedMessage =
          "Já existe um registro com essas informações. Verifique os dados e tente novamente.";
      }

      // Se for erro de campo, mostrar no campo
      if (errorField) {
        setFormError(errorField, {
          type: "manual",
          message: translatedMessage,
        });
      } else {
        // Mostrar no toast
        toast({
          title: "Erro ao cadastrar empresa",
          description: translatedMessage,
          variant: "destructive",
        });
      }

      setSubmitError(translatedMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error: submitError };
};
