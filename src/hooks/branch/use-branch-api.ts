import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { Branch } from "../../../types/company";

export function useBranchApi() {
  const { data: session } = useSession();

  /**
   * Busca uma filial por ID
   */
  const fetchBranchById = async (id: number): Promise<Branch | null> => {
    try {
      const res = await fetch(`/api/branch/${id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao buscar filial por ID");

      const branchData = await res.json();

      return {
        ...branchData,
        services: Array.isArray(branchData.services)
          ? branchData.services.map((s: any) =>
              typeof s === "number" ? s : s.id
            )
          : [],
        employees: branchData.employees ?? [],
      };
    } catch (error) {
      console.error("❌ Erro ao buscar filial:", error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar os dados da filial por ID.",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Vincula um serviço à filial
   */
  const linkService = async (
    branchId: number,
    serviceId: number
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/branch/${branchId}/service/${serviceId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao vincular o serviço");

      toast({
        title: "Serviço vinculado",
        description: "Serviço vinculado à filial com sucesso.",
      });

      return true;
    } catch (error) {
      console.error("❌ Erro ao vincular serviço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o serviço à filial.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Desvincula um serviço da filial
   */
  const unlinkService = async (
    branchId: number,
    serviceId: number
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/branch/${branchId}/service/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao desvincular o serviço");

      toast({
        title: "Serviço desvinculado",
        description: "Serviço removido da filial com sucesso.",
        variant: "destructive",
      });

      return true;
    } catch (error) {
      console.error("❌ Erro ao desvincular serviço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível desvincular o serviço da filial.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    fetchBranchById,
    linkService,
    unlinkService,
  };
}
