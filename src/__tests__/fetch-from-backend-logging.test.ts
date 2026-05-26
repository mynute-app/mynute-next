/**
 * @jest-environment node
 */
// Tests that console.error is suppressed in production for fetchFromBackend
// to avoid leaking backend URLs, companyId, and schema_name in prod logs.

describe("fetchFromBackend — logging guard", () => {
  let consoleSpy: jest.SpyInstance;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalNodeEnv,
      configurable: true,
    });
  });

  it("does NOT call console.error for network errors when NODE_ENV=production", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });

    // Reset module to pick up new NODE_ENV
    jest.resetModules();
    const { fetchFromBackend } = await import("@/lib/api/fetch-from-backend");

    // Simulate a network error by passing an invalid URL via mocked global fetch
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Network error")) as typeof fetch;

    try {
      await fetchFromBackend(
        new Request("http://localhost/api/test"),
        "/test",
        "token123",
        { method: "GET" },
      );
    } catch {
      // expected to throw
    }

    expect(consoleSpy).not.toHaveBeenCalled();

    global.fetch = originalFetch;
  });

  it("calls console.error for network errors when NODE_ENV=development", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      configurable: true,
    });

    jest.resetModules();
    const { fetchFromBackend } = await import("@/lib/api/fetch-from-backend");

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Network error")) as typeof fetch;

    try {
      await fetchFromBackend(
        new Request("http://localhost/api/test"),
        "/test",
        "token123",
        { method: "GET" },
      );
    } catch {
      // expected to throw
    }

    expect(consoleSpy).toHaveBeenCalled();

    global.fetch = originalFetch;
  });
});
