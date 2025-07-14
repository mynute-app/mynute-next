import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface BranchDesignImages {
  profile: {
    alt: string;
    title: string;
    caption: string;
    url: string;
  };
  logo: {
    alt: string;
    title: string;
    caption: string;
    url: string;
  };
  banner: {
    alt: string;
    title: string;
    caption: string;
    url: string;
  };
  background: {
    alt: string;
    title: string;
    caption: string;
    url: string;
  };
  favicon: {
    alt: string;
    title: string;
    caption: string;
    url: string;
  };
}

interface BranchDesignColors {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
}

interface BranchDesign {
  colors: BranchDesignColors;
  images: BranchDesignImages;
}

export interface BranchData {
  id: string;
  company_id: string;
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  time_zone: string;
  design: BranchDesign;
  employees: any[];
  services: any[];
  appointments: any[];
  service_density: number | null;
  branch_density: number;
}

interface UseGetBranchProps {
  branchId: string | number;
  enabled?: boolean; // Para controlar se deve fazer a requisição automaticamente
}

export function useGetBranch({ branchId, enabled = true }: UseGetBranchProps) {
  const [data, setData] = useState<BranchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBranch = async () => {
    if (!branchId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("🏢 Buscando dados da filial:", branchId);

      const response = await fetch(`/api/branch/${branchId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar filial");
      }

      const branchData = await response.json();
      console.log("✅ Dados da filial carregados:", branchData);

      setData(branchData);
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error("❌ Erro ao buscar filial:", errorMessage);

      setError(errorMessage);
      setData(null);

      toast({
        title: "Erro ao carregar filial",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch function para recarregar os dados
  const refetch = () => {
    fetchBranch();
  };

  // Auto-fetch quando o hook é inicializado (se enabled=true)
  useEffect(() => {
    if (enabled && branchId) {
      fetchBranch();
    }
  }, [branchId, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch,
    fetchBranch, // Função manual para buscar
  };
}
