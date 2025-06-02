import { useEffect } from "react";
import { useSubdomainStore } from "@/store/subdomain";

export function useSubdomain() {
  const { companyId, setCompanyId } = useSubdomainStore();

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;

      // Check if we're on localhost for development
      if (hostname === "localhost") {
        // You can handle local development differently
        // For example, you might parse from a query parameter or use a default
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("companyId");
        if (id) setCompanyId(id);
      } else {
        // Extract subdomain (assumes format: subdomain.domain.com)
        const parts = hostname.split(".");

        // If we have a subdomain (more than 2 parts in the hostname)
        if (parts.length > 2) {
          const subdomain = parts[0];

          // Here you would typically make an API call to get the company ID from subdomain
          // For now, we'll just set it directly if it's not already set
          if (!companyId && subdomain !== "www") {
            // In a real app, you might do:
            // fetchCompanyIdFromSubdomain(subdomain).then(id => setCompanyId(id));

            // For demo, we're just using the subdomain as the ID
            setCompanyId(subdomain);
          }
        }
      }
    }
  }, [companyId, setCompanyId]);

  return { companyId };
}
