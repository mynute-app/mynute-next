import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressFieldProps {
  register: any;
  error?: string;
}

export function AddressField({ register, error }: AddressFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location.address">Address</Label>
      <Input
        id="location.address"
        placeholder="Street name, apt, suite, floor"
        {...register("location.address")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
