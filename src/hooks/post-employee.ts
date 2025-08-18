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
  timezone: z.string().min(1, "O fuso horário é obrigatório."),
});

type AddEmployeeFormValues = z.infer<typeof addEmployeeSchema>;

export const useAddEmployeeForm = (onSuccess?: () => void) => {
  const form = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
      timezone: "America/Sao_Paulo",
    },
  });

  const { toast } = useToast();

  const handleSubmit = async (data: AddEmployeeFormValues) => {
    try {
      console.log("🔍 Hook - Data received:", data);

      // Garantir que o telefone está no formato E164
      let phone = data.phone;
      if (phone) {
        // Remove todos os caracteres não numéricos
        const digits = phone.replace(/\D/g, "");

        // Se não começar com 55, adiciona o código do Brasil
        if (digits.startsWith("55")) {
          phone = `+${digits}`;
        } else {
          phone = `+55${digits}`;
        }

        // Verificar se o telefone tem o tamanho correto (13 dígitos total: +55 + 11 dígitos)
        if (phone.length < 13 || phone.length > 14) {
          throw new Error("Telefone deve ter o formato +5511999999999");
        }
      }

      const requestData = {
        ...data,
        phone,
        timezone: data.timezone || "America/Sao_Paulo",
      };

      console.log("🔍 Hook - Data being sent to API:", requestData);

      const response = await fetch("/api/employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar o funcionário.");
      }

      toast({
        title: "Funcionário criado!",
        description: "O funcionário foi criado com sucesso.",
      });

      form.reset();

      // Chamar o callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error("❌ Erro ao criar o funcionário:", error);

      toast({
        title: "Erro ao criar o funcionário",
        description:
          "Ocorreu um erro ao tentar criar o funcionário. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { form, handleSubmit };
};
