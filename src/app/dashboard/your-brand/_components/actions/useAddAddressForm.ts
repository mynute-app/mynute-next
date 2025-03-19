import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const addressSchema = z.object({
  city: z.string().min(1, "A cidade é obrigatória"),
  company_id: z.number().default(1),
  complement: z.string().optional(),
  country: z.string().min(1, "O país é obrigatório"),
  name: z.string().min(1, "O nome é obrigatório"),
  neighborhood: z.string().optional(),
  number: z.string().min(1, "O número é obrigatório"),
  state: z.string().min(1, "O estado é obrigatório"),
  street: z.string().min(1, "A rua é obrigatória"),
  zip_code: z
    .string()
    .min(8, "O CEP deve ter 8 dígitos")
    .max(8, "O CEP deve ter 8 dígitos"),
});

export const useAddAddressForm = () => {
  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      city: "",
      company_id: 1,
      complement: "",
      country: "Brasil",
      name: "",
      neighborhood: "",
      number: "",
      state: "",
      street: "",
      zip_code: "",
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      const filteredData = {
        city: data.city,
        company_id: data.company_id,
        complement: data.complement,
        country: data.country,
        name: data.name,
        neighborhood: data.neighborhood,
        number: data.number,
        state: data.state,
        street: data.street,
        zip_code: data.zip_code,
      };

      const response = await fetch("/api/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar endereço");
      }

      console.log("Endereço salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
    }
  };

  return { form, handleSubmit };
};
