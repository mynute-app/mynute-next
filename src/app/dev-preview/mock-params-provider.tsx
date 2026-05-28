"use client";

/**
 * MockParamsProvider
 *
 * Provides mock route params to child components that call `useParams()` from
 * `next/navigation`. This is needed for dev-preview pages that internally
 * read `useParams()` but are rendered under the /dev-preview/[pageName] route
 * (which would otherwise return `{ pageName: "..." }` instead of the
 * expected `{ branchId: "..." }`, `{ id: "..." }`, etc.).
 *
 * Implemented by providing the two React contexts that Next.js's `useParams`
 * reads from internally:
 * - `PathParamsContext` — used in production mode
 * - `NavigationPromisesContext.params` — used in development mode (Suspense DevTools)
 *
 * Note: Uses internal Next.js paths, tested against Next.js 15.3.x.
 */

import React from "react";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PathParamsContext, NavigationPromisesContext } = require("next/dist/shared/lib/hooks-client-context.shared-runtime") as {
  PathParamsContext: React.Context<Record<string, string>>;
  NavigationPromisesContext: React.Context<{ params: Promise<Record<string, string>> } | null>;
};

interface MockParamsProviderProps {
  mockParams: Record<string, string>;
  children: React.ReactNode;
}

/**
 * Wraps children with mock route params that override what `useParams()` returns.
 * Use this in the dev-preview registry for pages that call `useParams()` internally.
 */
export function MockParamsProvider({ mockParams, children }: MockParamsProviderProps) {
  // Stable promise for the dev-mode Suspense DevTools path (NavigationPromisesContext)
  const paramsPromise = React.useMemo(() => Promise.resolve(mockParams), [mockParams]);
  const navigationPromises = React.useMemo(() => ({ params: paramsPromise }), [paramsPromise]);

  return (
    <PathParamsContext.Provider value={mockParams}>
      <NavigationPromisesContext.Provider value={navigationPromises}>
        {children}
      </NavigationPromisesContext.Provider>
    </PathParamsContext.Provider>
  );
}
