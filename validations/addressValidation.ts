
import { z } from "zod";

export const addressSchema = z
  .object({
    selectedAddress: z
      .string()
      .min(1, "Você deve selecionar um endereço")
      .nullable(),
  })
  .refine(data => data.selectedAddress !== null, {
    message: "Você deve selecionar um endereço",
    path: ["selectedAddress"], 
  });
