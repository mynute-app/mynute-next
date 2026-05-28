import { notFound } from "next/navigation";
import { Suspense } from "react";
import { registry } from "../registry";
import { MockProvider } from "../mock-provider";
import { MockParamsProvider } from "../mock-params-provider";

interface DevPreviewPageProps {
  params: Promise<{ pageName: string }>;
  searchParams: Promise<{ state?: string }>;
}

/**
 * Renders a single registered page in dev-preview mode.
 *
 * URL pattern: /dev-preview/[pageName]?state=populated|empty|error
 *
 * The page component is lazy-loaded from the registry, wrapped in MockProvider
 * which starts MSW and patches fetch to inject the preview state header.
 */
export default async function DevPreviewPage({ params, searchParams }: DevPreviewPageProps) {
  const { pageName } = await params;
  const { state = "populated" } = await searchParams;

  const entry = registry[pageName];
  if (!entry) {
    notFound();
  }

  const previewState = (["populated", "empty", "error"].includes(state)
    ? state
    : "populated") as "populated" | "empty" | "error";

  const PageComponent = entry.component;
  const mockParams = entry.defaultParams;

  const pageElement = (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      }
    >
      <PageComponent />
    </Suspense>
  );

  return (
    <div data-preview-state={previewState} data-page-name={pageName}>
      <MockProvider previewState={previewState}>
        {mockParams ? (
          <MockParamsProvider mockParams={mockParams}>
            {pageElement}
          </MockParamsProvider>
        ) : (
          pageElement
        )}
      </MockProvider>
    </div>
  );
}

/**
 * Not exported in production — dynamic rendering only, no static pre-building
 * of dev-preview routes into production bundles.
 */
export const dynamic = "force-dynamic";
