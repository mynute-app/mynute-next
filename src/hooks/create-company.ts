import { useState } from "react";
import { CompanyRegisterSchema } from "../../schema/company-register";
import { createCompany } from "@/lib/create-company";

export const useCreateCompany = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: CompanyRegisterSchema) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createCompany(data);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
};
