import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define o schema de validação usando Zod
const userProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  about: z.string().max(6000).optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export const UserProfile = ({ initialData, onFormChange }:any ) => {
  // React Hook Form setup com Zod resolver
  const { control, handleSubmit, watch, reset } =
    useForm<UserProfileFormValues>({
      resolver: zodResolver(userProfileSchema),
      defaultValues: {
        fullName: "",
        phone: "",
        email: "",
        role: "",
        about: "",
      },
    });

  // Observa as mudanças e notifica o componente pai
  useEffect(() => {
    const subscription = watch(values => {
      if (onFormChange) onFormChange(values);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormChange]);

  // Atualiza os campos quando `initialData` muda
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <div>
      <div>
        <Label
          htmlFor="fullName"
          className="text-xs font-semibold text-gray-500"
        >
          Nome completo
        </Label>
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Input id="fullName" {...field} className="mt-1" />
          )}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label
            htmlFor="phone"
            className="text-xs font-semibold text-gray-500"
          >
            Telefone
          </Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input id="phone" placeholder="+55" {...field} className="mt-1" />
            )}
          />
        </div>
        <div className="flex-1">
          <Label
            htmlFor="email"
            className="text-xs font-semibold text-gray-500"
          >
            Email
          </Label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input id="email" readOnly disabled {...field} className="mt-1" />
            )}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="role" className="text-xs font-semibold text-gray-500">
          Função
        </Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Input id="role" placeholder="Role" {...field} className="mt-1" />
          )}
        />
      </div>
      <div>
        <Label htmlFor="about" className="text-xs font-semibold text-gray-500">
          Sobre
        </Label>
        <Controller
          name="about"
          control={control}
          render={({ field }) => (
            <Textarea
              id="about"
              maxLength={6000}
              placeholder="About you"
              {...field}
              className="mt-1"
            />
          )}
        />
        <p className="text-xs text-gray-500">
          {6000 - (watch("about")?.length || 0)} characters remaining
        </p>
      </div>
    </div>
  );
};
