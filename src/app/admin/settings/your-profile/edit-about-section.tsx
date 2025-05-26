import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  onSubmit: (data: UserProfileFormValues) => void;
}
export const UserProfileForm = ({ onSubmit }: UserProfileFormProps) => {
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
