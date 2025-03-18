import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const addEmployeeSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  surname: z.string().min(1, "O sobrenome é obrigatório."),
  email: z.string().email("Email inválido."),
  phone: z.string().min(10, "O telefone é obrigatório."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: z.enum(["user", "admin"]).default("user"),
});

type AddEmployeeFormValues = z.infer<typeof addEmployeeSchema>;

export const useAddEmployeeForm = () => {
  const form = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
    },
  });

  const { toast } = useToast();

  const handleSubmit = async (data: AddEmployeeFormValues) => {
    try {
      const response = await fetch("/api/employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar o funcionário.");
      }

      toast({
        title: "Funcionário criado!",
        description: "O funcionário foi criado com sucesso.",
      });

      form.reset();
    } catch (error) {
      console.error("❌ Erro ao criar o funcionário:", error);

      toast({
        title: "Erro ao criar o funcionário",
        description:
          "Ocorreu um erro ao tentar criar o funcionário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return { form, handleSubmit };
};
