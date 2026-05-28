import { notFound } from "next/navigation";
import type { ReactNode } from "react";

interface DevPreviewLayoutProps {
  children: ReactNode;
}

/**
 * Layout for /dev-preview/* routes.
 *
 * - Renders with zero chrome (no sidebar, no auth header)
 * - Returns 404 in production builds (nested layouts must NOT render html/body)
 */
export default function DevPreviewLayout({ children }: DevPreviewLayoutProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <>{children}</>;
}
