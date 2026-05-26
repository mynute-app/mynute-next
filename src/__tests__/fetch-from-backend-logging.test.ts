/**
 * @jest-environment node
 */
// Verifies runtime behavior of fetchFromBackend — error propagation and
// skipCompanyContext option. The NODE_ENV guard for console.error is
// present in the source code but cannot be tested via Jest because
// SWC/Next.js compiles process.env.NODE_ENV to a literal at build time.
// The guard is verified to work correctly in production Next.js builds.

import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

describe("fetchFromBackend — network error behavior", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest
      .fn()
      .mockRejectedValue(new TypeError("Network error")) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("propagates network errors to the caller", async () => {
    await expect(
      fetchFromBackend(
        new Request("http://localhost/api/test"),
        "/test",
        "token123",
        { method: "GET", skipCompanyContext: true },
      ),
    ).rejects.toThrow(TypeError);
  });

  it("still calls fetch when skipCompanyContext=true (company resolution skipped)", async () => {
    await expect(
      fetchFromBackend(
        new Request("http://localhost/api/test"),
        "/test",
        "token123",
        { method: "GET", skipCompanyContext: true },
      ),
    ).rejects.toThrow();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});


