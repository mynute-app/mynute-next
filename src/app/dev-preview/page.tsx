import Link from "next/link";
import { registry, CATEGORIES, PREVIEW_STATES, PREVIEW_STATE_LABELS } from "./registry";

/**
 * Dev Preview index page — lists all registered pages with state links.
 * Accessible at /dev-preview in development mode.
 * Blocked in production by layout.tsx.
 */
export default function DevPreviewIndexPage() {
  // Group registry entries by category
  const grouped = Object.entries(registry).reduce<
    Record<string, Array<{ name: string; title: string }>>
  >((acc, [name, entry]) => {
    const cat = entry.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ name, title: entry.title });
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-orange-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-600">
              Development Only
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Dev Preview</h1>
          <p className="mt-1 text-gray-500">
            Visual preview of all dashboard pages with mock data — no login required.
            Used for automated screenshot testing.
          </p>
        </div>

        {/* State legend */}
        <div className="mb-8 flex gap-4">
          {PREVIEW_STATES.map((state) => (
            <div key={state} className="flex items-center gap-2 text-sm text-gray-600">
              <div
                className={`h-2 w-2 rounded-full ${
                  state === "populated"
                    ? "bg-green-500"
                    : state === "empty"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              {PREVIEW_STATE_LABELS[state]}
            </div>
          ))}
        </div>

        {/* Page groups */}
        <div className="space-y-8">
          {Object.entries(CATEGORIES)
            .filter(([cat]) => grouped[cat]?.length)
            .map(([cat, label]) => (
              <div key={cat}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  {label}
                </h2>
                <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
                  {grouped[cat].map(({ name, title }) => (
                    <div key={name} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium text-gray-900">{title}</p>
                        <p className="text-xs text-gray-400">/dev-preview/{name}</p>
                      </div>
                      <div className="flex gap-2">
                        {PREVIEW_STATES.map((state) => (
                          <Link
                            key={state}
                            href={`/dev-preview/${name}?state=${state}`}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                              state === "populated"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : state === "empty"
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            {state}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
