import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const addServiceSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  duration: z.string().min(1, "A duração é obrigatória."),
  buffer: z.string().optional(),
  cost: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  hidden: z.boolean().optional(),
});

type AddServiceFormValues = z.infer<typeof addServiceSchema>;

export const useAddServiceForm = () => {
  const form = useForm<AddServiceFormValues>({
    resolver: zodResolver(addServiceSchema),
    defaultValues: {
      title: "",
      duration: "",
      buffer: "",
      cost: "",
      location: "",
      category: "",
      hidden: false,
    },
  });
   const { toast } = useToast();
  const handleSubmit = async (data: AddServiceFormValues) => {
    try {
      const response = await fetch("http://localhost:3333/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar o serviço.");
      }

      const createdService = await response.json();

      // Exibe o toast de sucesso
      toast({
        title: "Serviço criado!",
        description: "O serviço foi criado com sucesso.",
      });

      // Limpa o formulário
      form.reset();
    } catch (error) {
      console.error(error);

      // Exibe o toast de erro
      toast({
        title: "Erro ao criar o serviço",
        description:
          "Ocorreu um erro ao tentar criar o serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return { form, handleSubmit };
};
