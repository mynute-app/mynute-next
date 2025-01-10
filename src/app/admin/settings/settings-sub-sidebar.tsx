import { Button } from "@/components/ui/button";
import { Layout, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type DataBusinesses = {
  id: number;
  businessName: string;
}[];

export const SettingsSubSidebar = () => {
  const [isBrandSubMenuOpen, setIsBrandSubMenuOpen] = useState(false);
  const [businesses, setBusinesses] = useState<DataBusinesses>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch("http://localhost:3333/business");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBusinesses(data);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => setIsBrandSubMenuOpen(!isBrandSubMenuOpen)}
        >
          <Layout className="h-4 w-4" />
          <Link href="/admin/settings/your-brand">Sua marca</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Users className="h-4 w-4" />
          <Link href="/admin/settings/your-profile">Perfil</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Users className="h-4 w-4" />
          <Link href="/admin/settings/your-team">Time</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Calendar className="h-4 w-4" />
          <Link href="/admin/settings/services">Serviços</Link>
        </Button>
      </div>
    </div>
  );
};
