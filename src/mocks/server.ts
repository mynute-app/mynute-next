/**
 * MSW Node server — used in Jest unit/component tests.
 * Intercepts fetch() calls and returns mock data from handlers.ts
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
