import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CardCustom } from "@/components/custom/Card-Custom";
import { useWizardStore } from "@/context/useWizardStore";
import { Skeleton } from "@/components/ui/skeleton";

type Business = {
  id: string;
  businessName: string;
  industry: string;
};

export const BusinessStep = () => {
  const { setSelectedBusiness, selectedBusiness } = useWizardStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3333/business"); // Update the URL accordingly
        if (!response.ok) throw new Error("Erro ao buscar empresas");

        const data = await response.json();
        setBusinesses(data);
      } catch (err) {
        setError("Erro ao carregar empresas.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusiness(businessId);
    const params = new URLSearchParams(window.location.search);
    params.set("businessId", businessId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2 md:pr-6">
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2 md:pr-6">
      {businesses.map(business => (
        <CardCustom
          key={business.id}
          title={business.industry}
          description={business.businessName}
          onClick={() => handleSelectBusiness(business.id)}
          isSelected={selectedBusiness === business.id}
        />
      ))}
    </div>
  );
};
