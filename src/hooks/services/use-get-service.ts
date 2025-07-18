import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  company_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  design: {
    colors: {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
    };
    images: {
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
    };
  };
  branches: any[];
  employees: any[];
  // Propriedade computada para compatibilidade
  imageUrl?: string;
}

interface UseGetServiceProps {
  serviceId: string;
  enabled?: boolean; // Para controlar quando fazer a busca
}

export function useGetService({
  serviceId,
  enabled = true,
}: UseGetServiceProps) {
  const { data: session } = useSession();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || !serviceId || !session?.accessToken) {
      return;
    }

    const fetchService = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔍 Buscando serviço:", serviceId);

        const response = await fetch(`/api/service/${serviceId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        console.log("📡 Status da resposta:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Erro na resposta:", errorData);
          throw new Error(errorData.error || "Erro ao buscar serviço");
        }

        const serviceData = await response.json();
        console.log("✅ Serviço encontrado:", serviceData);

        // Adicionar imageUrl computada para compatibilidade
        const processedService = {
          ...serviceData,
          imageUrl: serviceData.design?.images?.profile?.url || undefined,
        };

        setService(processedService);
      } catch (error) {
        console.error("❌ Erro ao buscar serviço:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";

        setError(errorMessage);

        toast({
          title: "Erro",
          description: `Erro ao carregar serviço: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, enabled, session?.accessToken, toast]);

  const refetch = async () => {
    if (!serviceId || !session?.accessToken) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Refazendo busca do serviço:", serviceId);

      const response = await fetch(`/api/service/${serviceId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      console.log("📡 Status da resposta refetch:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erro na resposta refetch:", errorData);
        throw new Error(errorData.error || "Erro ao buscar serviço");
      }

      const serviceData = await response.json();
      console.log("✅ Serviço refetch com sucesso:", serviceData);

      // Adicionar imageUrl computada para compatibilidade
      const processedService = {
        ...serviceData,
        imageUrl: serviceData.design?.images?.profile?.url || undefined,
      };

      setService(processedService);
    } catch (error) {
      console.error("❌ Erro ao refetch serviço:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    service,
    loading,
    error,
    refetch,
  };
}
