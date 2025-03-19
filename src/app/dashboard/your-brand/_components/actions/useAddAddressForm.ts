import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const addressSchema = z.object({
  street: z.string().min(1, "A rua é obrigatória"),
  number: z.string().min(1, "O número é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatória"),
  state: z.string().min(1, "O estado é obrigatório"),
  country: z.string().min(1, "O país é obrigatório"),
});

export const useAddAddressForm = () => {
  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      number: "",
      city: "",
      state: "",
      country: "",
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      console.log("Enviando endereço:", data);
      // Aqui você pode chamar a API para salvar o endereço
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
    }
  };

  return { form, handleSubmit };
};
