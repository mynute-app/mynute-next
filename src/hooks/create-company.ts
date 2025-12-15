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

  const submit = async (
    data: CompanyRegisterSchema,
    setFormError: UseFormSetError<CompanyRegisterSchema>
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
      console.log("🌐 [HOOK] URL Base:", url);
      console.log(
        "📤 [HOOK] Request Body:",
        JSON.stringify(cleanData, null, 2)
      );

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      console.log("📊 [HOOK] Status Code:", response.status);
      console.log("✅ [HOOK] Response OK:", response.ok);

      const text = await response.text();
      console.log("📥 [HOOK] Response Body:", text);

      let errorMessage = text;

      try {
        const json = JSON.parse(text);
        console.log("📦 [HOOK] Response JSON:", JSON.stringify(json, null, 2));
        errorMessage = json?.backendResponse || json?.message || text;
      } catch {}

      if (!response.ok) {
        console.error(
          "❌ [HOOK] Response não OK - Status:",
          response.status,
          "Message:",
          errorMessage
        );
        throw new Error(errorMessage);
      }

      const result = JSON.parse(text);
      console.log(
        "✅ [HOOK] Sucesso! Result:",
        JSON.stringify(result, null, 2)
      );

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Sua empresa foi criada com sucesso.",
      });

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

      // Log do erro original para debug
      console.error("❌ Erro ao cadastrar empresa:", errorMessage);

      setSubmitError(translatedMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error: submitError };
};
