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

      const response = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      const text = await response.text();
      let errorMessage = text;

      try {
        const json = JSON.parse(text);
        errorMessage = json?.backendResponse || json?.message || text;
      } catch {
 
      }

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Você será redirecionado para o login.",
      });

      router.push("/auth/employee");

      return JSON.parse(text);
    } catch (err: any) {
      const errorMessage = err.message;
      const normalizedMessage = errorMessage.toLowerCase();

      const constraintMap: Record<
        string,
        { field: keyof CompanyRegisterSchema; message: string }
      > = {
        uni_companies_name: {
          field: "name",
          message: "Já existe uma empresa com esse nome.",
        },
        uni_companies_tax_id: {
          field: "tax_id",
          message: "Já existe uma empresa com esse CNPJ.",
        },
        idx_employees_email: {
          field: "owner_email",
          message: "Já existe uma conta com esse e-mail.",
        },
        idx_employees_phone: {
          field: "owner_phone",
          message: "Já existe uma conta com esse telefone.",
        },
      };

      const matchedConstraint = Object.entries(constraintMap).find(
        ([constraint]) =>
          normalizedMessage.includes("duplicate key") &&
          normalizedMessage.includes(constraint)
      );

      if (matchedConstraint) {
        const [, { field, message }] = matchedConstraint;

        setFormError(field, {
          type: "manual",
          message,
        });

        toast({
          title: "Erro ao cadastrar empresa",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao cadastrar empresa",
          description: errorMessage,
          variant: "destructive",
        });
      }

      setSubmitError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error: submitError };
};
