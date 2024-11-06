import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessNameFieldProps {
  register: any;
  error?: string;
}

export function BusinessNameField({ register, error }: BusinessNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="businessName">Business name</Label>
      <Input
        id="businessName"
        placeholder="Nome da empresa"
        {...register("businessName")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
