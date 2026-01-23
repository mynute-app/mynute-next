"use client";

import { useMemo } from "react";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { decodeJWTToken } from "@/utils/decode-jwt";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session } = useSession();

  const accessToken = (session as any)?.accessToken as string | undefined;
  const decoded = useMemo(
    () => (accessToken ? decodeJWTToken(accessToken) : null),
    [accessToken]
  );

  const displayName = decoded?.name ?? "Usuario";
  const displayEmail = decoded?.email ?? "";
  const initials = useMemo(() => {
    const first = decoded?.name?.[0] ?? "U";
    const last = decoded?.surname?.[0] ?? "";
    return `${first}${last}`.toUpperCase();
  }, [decoded?.name, decoded?.surname]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
            <span className="text-sm font-medium text-sidebar-foreground">
              {initials || "U"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {displayEmail}
            </p>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
              <span className="text-sm font-medium text-sidebar-foreground">
                {initials || "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1 ">
              <p className="truncate font-semibold text-primary">
                {displayName}
              </p>
              <p className="truncate text-xs text-primary/60">
                {displayEmail}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
