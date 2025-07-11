import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { Branch } from "../../../../../../types/company";

const addressSchema = z.object({
  city: z.string().min(1, "A cidade é obrigatória"),
  complement: z.string().optional(),
  country: z.string().min(1, "O país é obrigatório"),
  name: z.string().min(1, "O nome é obrigatório"),
  neighborhood: z.string().optional(),
  number: z.string().min(1, "O número é obrigatório"),
  state: z.string().min(1, "O estado é obrigatório"),
  street: z.string().min(1, "A rua é obrigatória"),
  timezone: z.string().default("America/Sao_Paulo"),
  zip_code: z
    .string()
    .min(8, "O CEP deve ter 8 dígitos")
    .max(8, "O CEP deve ter 8 dígitos"),
});

type AddAddressFormValues = z.infer<typeof addressSchema>;

export const useAddAddressForm = () => {
  const form = useForm<AddAddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      city: "",
      complement: "",
      country: "Brasil",
      name: "",
      neighborhood: "",
      number: "",
      state: "",
      street: "",
      timezone: "America/Sao_Paulo",
      zip_code: "",
    },
  });

  const { toast } = useToast();

  const handleSubmit = async (
    data: AddAddressFormValues
  ): Promise<Branch | null> => {
    try {
      console.log("📋 Dados do formulário:", data);

      const response = await fetch("/api/branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro da API:", response.status, errorText);
        throw new Error("Erro ao salvar endereço");
      }

      const createdAddress = await response.json();
      console.log("✅ Endereço criado:", createdAddress);

      toast({
        title: "Endereço salvo!",
        description: "O endereço foi adicionado com sucesso.",
      });

      form.reset();
      return createdAddress;
    } catch (error) {
      console.error("❌ Erro ao salvar endereço:", error);

      toast({
        title: "Erro ao salvar endereço",
        description:
          "Ocorreu um erro ao tentar salvar o endereço. Tente novamente.",
        variant: "destructive",
      });

      return null;
    }
  };

  return { form, handleSubmit };
};
