import { useToast } from "@/hooks/use-toast";

export const useDeleteService = () => {
  const { toast } = useToast();

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/service/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o serviço.");
      }

      toast({
        title: "Serviço deletado!",
        description: "O serviço foi removido com sucesso.",
      });

      return true;
    } catch (error) {
      console.error("❌ Erro ao deletar o serviço:", error);

      toast({
        title: "Erro ao deletar serviço",
        description:
          "Ocorreu um erro ao tentar excluir o serviço. Tente novamente.",
        variant: "destructive",
      });

      return false;
    }
  };

  return { handleDelete };
};
