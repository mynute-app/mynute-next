"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/client/logout", { method: "DELETE" });
    router.refresh();
    router.push("/");
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
}
