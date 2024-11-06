import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CurrencyFieldProps {
  control: any;
  error?: string;
}

export function CurrencyField({ control, error }: CurrencyFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location.currency">Currency</Label>
      <Controller
        name="location.currency"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Brazil - BRL R$</SelectItem>
              <SelectItem value="USD">United States - USD $</SelectItem>
              {/* Adicione outras moedas conforme necessário */}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
