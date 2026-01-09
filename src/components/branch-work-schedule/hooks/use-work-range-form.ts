import { useState, useEffect, useCallback } from "react";

interface WorkRangeEditData {
  start_time: string;
  end_time: string;
  weekday: number;
  time_zone: string;
  services: string[];
}

export function useWorkRangeForm(initialData?: WorkRangeEditData) {
  const [formData, setFormData] = useState<WorkRangeEditData>(
    () =>
      initialData || {
        start_time: "09:00",
        end_time: "17:00",
        weekday: 1,
        time_zone: "America/Sao_Paulo",
        services: [],
      }
  );

  const [initialServices, setInitialServices] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setInitialServices(initialData.services || []);
    }
  }, [initialData]);

  const updateField = useCallback(
    (field: keyof WorkRangeEditData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const getChangedServices = useCallback(() => {
    const removedServices = initialServices.filter(
      serviceId => !formData.services.includes(serviceId)
    );
    const addedServices = formData.services.filter(
      serviceId => !initialServices.includes(serviceId)
    );
    return { removedServices, addedServices };
  }, [formData.services, initialServices]);

  return {
    formData,
    initialServices,
    updateField,
    getChangedServices,
  };
}
