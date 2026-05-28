"use client";

import { useEffect, useState, useCallback } from "react";

type PreviewState = "populated" | "empty" | "error";

interface MockProviderProps {
  children: React.ReactNode;
  previewState?: PreviewState;
}

/**
 * Wraps dev-preview pages with MSW browser worker initialization.
 *
 * This component:
 * 1. Starts the MSW service worker before rendering any children
 * 2. Sets a global preview state so handlers know which scenario to return
 * 3. Shows a loading gate until MSW is ready (prevents race conditions)
 *
 * Only active in development — in production this route is blocked at layout level.
 */
export function MockProvider({ children, previewState = "populated" }: MockProviderProps) {
  const [mswReady, setMswReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Patch fetch to inject x-preview-state header into all API requests
  const patchFetch = useCallback((state: PreviewState) => {
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      // Only inject header for internal API routes
      if (url.startsWith("/api/") || url.startsWith(window.location.origin + "/api/")) {
        const headers = new Headers(init?.headers);
        headers.set("x-preview-state", state);
        return originalFetch(input, { ...init, headers });
      }
      return originalFetch(input, init);
    };

    // Restore original fetch on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    let restoreFetch: (() => void) | undefined;

    const initMsw = async () => {
      // All MSW initialization is inside this block so Turbopack can
      // statically eliminate import("@/mocks/browser") from the production bundle.
      if (process.env.NODE_ENV !== "production") {
        try {
          restoreFetch = patchFetch(previewState);
          const { worker } = await import("@/mocks/browser");
          await worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: {
              url: "/mockServiceWorker.js",
            },
          });
          setMswReady(true);
        } catch (err) {
          console.error("[MockProvider] Failed to start MSW:", err);
          setError(err instanceof Error ? err.message : "Failed to initialize mock");
        }
      } else {
        // Production: this path is unreachable (layout returns 404), but
        // resolves the loading gate as a safety net.
        setMswReady(true);
      }
    };

    initMsw();

    return () => {
      restoreFetch?.();
      // Stop the service worker when preview unmounts
      if (process.env.NODE_ENV !== "production") {
        import("@/mocks/browser").then(({ worker }) => {
          worker.stop();
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 p-8">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow">
          <h2 className="mb-2 text-lg font-semibold text-red-700">
            Preview initialization failed
          </h2>
          <p className="text-sm text-red-600">{error}</p>
          <p className="mt-4 text-xs text-gray-500">
            Make sure the MSW service worker is registered. Run:{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5">npx msw init public/ --save</code>
          </p>
        </div>
      </div>
    );
  }

  if (!mswReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Initializing dev preview...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
