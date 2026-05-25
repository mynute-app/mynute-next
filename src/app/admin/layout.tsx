import Link from "next/link";
import { ReactNode } from "react";

export const metadata = { title: "Mynute Admin" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 border-r bg-card flex flex-col gap-1 p-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Admin
        </p>
        <Link
          href="/admin/whatsapp"
          className="rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          WhatsApp
        </Link>
        <Link
          href="/admin/whatsapp/proxy"
          className="rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Proxy
        </Link>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
