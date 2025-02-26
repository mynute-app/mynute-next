import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const addServiceSchema = z.object({
  name: z.string().min(1, "O título é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  price: z
    .string()
    .min(1, "O preço é obrigatório.")
    .transform(val => Number(val)),
  duration: z
    .string()
    .min(1, "A duração é obrigatória.")
    .transform(val => Number(val)),
});

type AddServiceFormValues = z.infer<typeof addServiceSchema>;

export const useAddServiceForm = () => {
  const form = useForm<AddServiceFormValues>({
    resolver: zodResolver(addServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 0,
    },
  });

  const { toast } = useToast();

  const handleSubmit = async (data: AddServiceFormValues) => {
    try {
      const response = await fetch("/api/service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar o serviço.");
      }

      toast({
        title: "Serviço criado!",
        description: "O serviço foi criado com sucesso.",
      });

      form.reset();
    } catch (error) {
      console.error("❌ Erro ao criar o serviço:", error);

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
