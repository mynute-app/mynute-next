import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import type { UseFormSetError } from "react-hook-form";

const addEmployeeSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  surname: z.string().min(1, "O sobrenome é obrigatório."),
  email: z.string().email("Email inválido."),
  phone: z
    .string()
    .min(1, "O telefone é obrigatório.")
    .regex(/^\+55\d{10,11}$/, "Telefone deve estar no formato +5511999999999"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: z.enum(["user", "admin"]).default("user"),
  timezone: z.string().min(1, "O fuso horário é obrigatório."),
});

type AddEmployeeFormValues = z.infer<typeof addEmployeeSchema>;

function extractErrorBundle(raw: unknown): string {
  if (!raw) return "";
  try {
    const err = typeof raw === "string" ? JSON.parse(raw) : (raw as any);
    const parts: string[] = [];
    if (err?.description_en) parts.push(String(err.description_en));
    if (err?.description_br) parts.push(String(err.description_br));
    if (err?.message) parts.push(String(err.message));

    const inner = err?.inner_error;
    if (inner) {
      if (typeof inner === "string") parts.push(inner);
      else if (typeof inner === "object") {
        for (const k of Object.keys(inner)) {
          try {
            parts.push(String(inner[k]));
          } catch {}
        }
      }
    }
    const joined = parts.join(" | ").trim();
    return (joined || JSON.stringify(err)).toLowerCase();
  } catch {
    return typeof raw === "string"
      ? raw.toLowerCase()
      : String(raw).toLowerCase();
  }
}

export const useAddEmployeeForm = (onSuccess?: () => void) => {
  const form = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      password: "Senha123!",
      role: "user",
      timezone: "America/Sao_Paulo",
    },
  });

  const { toast } = useToast();

  const handleSubmit = async (
    data: AddEmployeeFormValues,
    setFormError?: UseFormSetError<AddEmployeeFormValues>
  ) => {
    try {
      // Normaliza phone para E.164 (+55...)
      let phone = data.phone;
      if (phone) {
        const digits = phone.replace(/\D/g, "");
        phone = digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
        // +55 + (10|11) dígitos => length 13|14
        if (phone.length < 13 || phone.length > 14) {
          setFormError?.("phone", {
            type: "manual",
            message: "Telefone deve estar no formato +5511999999999",
          });
          return false;
        }
      }

      const requestData = {
        ...data,
        phone,
        timezone: data.timezone || "America/Sao_Paulo",
        role: data.role || "user",
        password: data.password || "Senha123!",
      };

      const response = await fetch("/api/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        // ——— analisar resposta e setar TODOS os campos com problema ———
        const rawText = await response.text().catch(() => "");
        const msg = extractErrorBundle(rawText);

        const matchesEmailConstraint = msg.includes("idx_employees_email");
        const matchesPhoneConstraint = msg.includes("idx_employees_phone");
        const mentionsUnique = msg.includes("unique constraint");
        // fallback por palavra-chave, caso o backend mude o nome da constraint
        const mentionsEmail =
          matchesEmailConstraint || (mentionsUnique && msg.includes("email"));
        const mentionsPhone =
          matchesPhoneConstraint || (mentionsUnique && msg.includes("phone"));

        let setAnyFieldError = false;

        if (mentionsEmail) {
          setFormError?.("email", {
            type: "manual",
            message: "Este email já está cadastrado no sistema.",
          });
          setAnyFieldError = true;
        }

        if (mentionsPhone) {
          setFormError?.("phone", {
            type: "manual",
            message: "Este telefone já está cadastrado no sistema.",
          });
          setAnyFieldError = true;
        }

        // Se achamos pelo menos um campo problemático, não prossegue nem mostra toast
        if (setAnyFieldError) return false;

        // Erro genérico: opcionalmente jogue em um "root" se você exibir no topo do form
        // setFormError?.("root" as any, { type: "server", message: "Não foi possível criar o funcionário. Verifique os dados." });
        // Ou escolha um campo mais adequado ao seu fluxo:
        setFormError?.("email", {
          type: "manual",
          message:
            "Não foi possível criar o funcionário. Verifique os dados e tente novamente.",
        });
        return false;
      }

      // sucesso
      toast({
        title: "Funcionário criado!",
        description: "O funcionário foi criado com sucesso.",
      });

      form.reset({
        name: "",
        surname: "",
        email: "",
        phone: "",
        password: "Senha123!",
        role: "user",
        timezone: "America/Sao_Paulo",
      });

      onSuccess?.();
      return true;
    } catch {
      // nada de toast: erro de rede/inesperado -> mensagem no topo ou num campo específico
      setFormError?.("email", {
        type: "manual",
        message:
          "Ocorreu um erro ao criar o funcionário. Verifique os dados e tente novamente.",
      });
      return false;
    }
  };

  return { form, handleSubmit };
};
