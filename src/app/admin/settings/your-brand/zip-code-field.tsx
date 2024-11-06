import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ZipCodeFieldProps {
  register: any;
  error?: string;
}

export function ZipCodeField({ register, error }: ZipCodeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location.zipCode">Zip or postal code</Label>
      <Input
        id="location.zipCode"
        placeholder="000000"
        {...register("location.zipCode")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
