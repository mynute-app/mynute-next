"use client";

import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileSidebarToggle() {
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center border-b bg-background/95 backdrop-blur lg:hidden">
        <div className="px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            className="h-8 w-8"
            onClick={toggleSidebar}
          >
            {openMobile ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      <div className="h-14 lg:hidden" />
    </>
  );
}
