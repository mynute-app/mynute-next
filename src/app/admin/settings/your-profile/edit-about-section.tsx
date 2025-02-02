import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetUser } from "@/hooks/get-useUser";
import { Button } from "@/components/ui/button";

// Define o schema de validação usando Zod
const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export const UserProfileForm = ({ onSubmit }: any) => {
  const { user, loading } = useGetUser();
  const { control, handleSubmit } = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      surname: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="name" className="text-xs font-semibold text-gray-500">
          Nome
        </Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input id="name" {...field} className="mt-1" />
          )}
        />
      </div>
      <div>
        <Label
          htmlFor="surname"
          className="text-xs font-semibold text-gray-500"
        >
          Sobrenome
        </Label>
        <Controller
          name="surname"
          control={control}
          render={({ field }) => (
            <Input id="surname" {...field} className="mt-1" />
          )}
        />
      </div>
      <Button type="submit">Salvar</Button>
    </form>
  );
};
