
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


export const personSchema = z
  .object({
    selectedPerson: z
      .string()
      .min(1, "Você deve selecionar uma pessoa")
      .nullable(),
  })
  .refine(data => data.selectedPerson !== null, {
    message: "Você deve selecionar uma pessoa",
    path: ["selectedPerson"],
  });

export const serviceSchema = z
  .object({
    selectedService: z
      .string()
      .min(1, "Você deve selecionar um serviço")
      .nullable(),
  })
  .refine(data => data.selectedService !== null, {
    message: "Você deve selecionar um serviço",
    path: ["selectedService"],
  });