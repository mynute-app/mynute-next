"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressField } from "../../your-brand/_components/address-field";
import { useGetCompany } from "@/hooks/get-one-company";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BusinessSchema } from "../../../../../schema";
import * as zod from "zod";
import { useCompany } from "@/hooks/get-company";
import { AddAddressDialog } from "../../your-brand/_components/add-address-dialog";
import { useEffect, useState } from "react";
export const Branch = () => {
  const { company, loading } = useCompany();
  const [branches, setBranches] = useState<any[]>([]);
  useEffect(() => {
    if (company?.branches) {
      setBranches(company.branches);
    }
  }, [company]);
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
  const handleAddAddress = (newAddress: any) => {
    setBranches(prev => [...prev, newAddress]);
  };
  const handleDeleteBranch = (branchId: number) => {
    setBranches(prev => prev.filter(branch => branch.id !== branchId));
  };
  return (
    <div className="space-y-4 p-4">
      <div className="text-lg font-semibold flex justify-between items-center">
        Filiais <AddAddressDialog onCreate={handleAddAddress} />
      </div>

      {loading ? (
        <Skeleton className="h-6 w-full" />
      ) : branches.length ? (
        branches.map((branch, index) => (
          <AddressField
            key={branch.id}
            register={register}
            branch={branch}
            index={index}
            watch={watch}
            onDelete={handleDeleteBranch}
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
