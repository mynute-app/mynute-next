import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CardCustom } from "@/components/custom/Card-Custom";
import { useWizardStore } from "@/context/useWizardStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type Business = {
  id: string;
  businessName: string;
  industry: string;
};

export const BusinessStep = () => {
  const { setSelectedBusiness, selectedBusiness } = useWizardStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3333/business");
        if (!response.ok) throw new Error("Erro ao buscar empresas");

        const data = await response.json();
        setBusinesses(data);
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao carregar empresas.",
          variant: "destructive",
        });
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
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2">
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className="h-20 md:h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2">
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
