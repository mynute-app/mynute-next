
import { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { AddressField } from "./address-field";
import { CityField } from "./city-field";
import { CurrencyField } from "./currency-field";
import { CountryField } from "./country-field";
import { ZipCodeField } from "./zip-code-field";
import { StateField } from "./state-field";
import { z } from "zod";
import { BusinessSchema } from "../../../../../schema";

type FormData = z.infer<typeof BusinessSchema>;

interface LocationProps {
  control: Control<FormData>;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function Location({ control, register, errors }: LocationProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Location</h3>
      <p className="text-sm text-gray-600">
        Provide a business address to list on your Booking Page.
      </p>

      <AddressField
        register={register}
        error={errors.location?.address?.message}
      />
      <CityField register={register} error={errors.location?.city?.message} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StateField control={control} error={errors.location?.state?.message} />
        <ZipCodeField
          register={register}
          error={errors.location?.zipCode?.message}
        />
      </div>

      <CountryField
        control={control}
        error={errors.location?.country?.message}
      />
      <CurrencyField
        control={control}
        error={errors.location?.currency?.message}
      />
    </div>
  );
}
