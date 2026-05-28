import "@testing-library/jest-dom";

// Global fetch mock — returns successful empty responses by default.
// Tests that need specific API responses should override this with jest.fn():
//   global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [...] }) })
// For full MSW integration in a test file, import { server } from "@/mocks/server" directly.
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({}),
  text: async () => "{}",
  headers: new Headers({ "Content-Type": "application/json" }),
});

// Mock Next.js navigation hooks (unavailable in jsdom)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Next-Auth (requires a real server session in tests)
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: { name: "Test Employee", email: "test@example.com" },
      accessToken: "mock-test-token",
    },
    status: "authenticated",
  }),
  signOut: jest.fn(),
  signIn: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/font (not available in jsdom)
jest.mock("next/font/local", () => ({
  __esModule: true,
  default: () => ({
    className: "mock-font",
    style: { fontFamily: "mock-font" },
    variable: "--mock-font",
  }),
}));

// Polyfill for window.matchMedia (jsdom doesn't implement it)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Polyfill ResizeObserver (jsdom doesn't implement it)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Polyfill scrollIntoView (required by Radix UI Select in jsdom)
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = jest.fn();
}

// Suppress console.error for known React/Next.js test warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress specific known warnings in test environment
    const message = String(args[0]);
    if (
      message.includes("Warning: ReactDOM.render is no longer supported") ||
      message.includes("Warning: An update to") ||
      message.includes("act(")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
