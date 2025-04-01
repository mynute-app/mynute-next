"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { AddAddressDialog } from "../../your-brand/_components/add-address-dialog";
import { AddressField } from "../../your-brand/_components/address-field";
import { useGetCompany } from "@/hooks/get-one-company";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BusinessSchema } from "../../../../../schema";
import * as zod from "zod";
import { useCompany } from "@/hooks/get-company";
export const Branch = () => {
  const { company, loading } = useCompany();
  const form = useForm<zod.infer<typeof BusinessSchema>>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: {
      name: "",
    },
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  return (
    <div className="space-y-4   p-4">
      <div className="text-lg font-semibold flex justify-between items-center">
        Filiais <AddAddressDialog />
      </div>

      {loading ? (
        <Skeleton className="h-6 w-full" />
      ) : company?.branches?.length ? (
        company.branches.map((branch, index) => (
          <AddressField
            key={branch.id}
            register={register}
            branch={branch}
            index={index}
            watch={watch}
            onDelete={(branchId: number) => {
              const updatedBranches = company.branches.filter(
                b => b.id !== branchId
              );
              company.branches = updatedBranches;
            }}
          />
        ))
      ) : (
        <div className="text-sm text-gray-600 text-center">
          Nenhuma filial cadastrada.
        </div>
      )}
    </div>
  );
};
