import { useEffect, useState } from "react";
import { useSubdomain } from "./use-subdomain";
import { useCompany } from "./get-company";

interface Company {
  // Add your company type here
  id: string;
  // other company properties
  [key: string]: any;
}

export function useCompanyFromSubdomain() {
  const { companyId } = useSubdomain();
  // Use the existing useCompany hook to leverage its functionality
  const { company, loading } = useCompany(companyId || undefined);
  const [error, setError] = useState<Error | null>(null);

  // Handle errors if the company is not found
  useEffect(() => {
    if (!loading && !company && companyId) {
      setError(new Error("Company not found with the current subdomain ID"));
    } else {
      setError(null);
    }
  }, [company, loading, companyId]);

  return { company, loading, error, companyId };
}
