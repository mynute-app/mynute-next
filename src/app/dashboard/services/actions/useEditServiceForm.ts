"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Esquema de validação Zod
export const editServiceSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  duration: z.string().min(1, "A duração é obrigatória."),
  buffer: z.string().optional(),
  cost: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  hidden: z.boolean().optional(),
});

export type EditServiceFormValues = z.infer<typeof editServiceSchema>;

type UseEditServiceFormProps = {
  defaultValues: EditServiceFormValues;
  onSubmit: (data: EditServiceFormValues) => void;
};

export const useEditServiceForm = ({
  defaultValues,
  onSubmit,
}: UseEditServiceFormProps) => {
  const form = useForm<EditServiceFormValues>({
    resolver: zodResolver(editServiceSchema),
    defaultValues,
  });

  const { handleSubmit, formState } = form;

  const submitHandler = handleSubmit(data => {
    const formattedData = {
      ...data,
      buffer: data.buffer ?? "", // Garante que seja string
      cost: data.cost ?? "",
      location: data.location ?? "",
      category: data.category ?? "",
      hidden: data.hidden ?? false,
    };
    onSubmit(formattedData);
  });

  return { form, submitHandler, formState };
};
