import { useEffect, useState } from "react";

type Brand = {
  id: number;
  businessId: string;
  logo: string | null;
  bannerImage: string | null;
  bannerColor: string;
  primaryColor: string;
};

export function useBrandByBusinessId() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);

    fetch(`http://localhost:3333/brands`)
      .then(res => res.json())
      .then(data => {
        setBrand(data?.[0] || null);
      })
      .catch(err => {
        console.error("Erro ao buscar brand:", err);
        setBrand(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { brand, loading };
}
