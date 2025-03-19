import { Button } from "@/components/ui/button";
import { Layout, Users, Calendar } from "lucide-react";
import Link from "next/link";

export const SettingsSubSidebar = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
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
