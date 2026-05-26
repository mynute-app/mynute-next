import { test, expect } from "@playwright/test";
import { registry, PREVIEW_STATES, PREVIEW_STATE_LABELS } from "../../src/app/dev-preview/registry";

/**
 * Automated visual screenshot tests for all dev-preview pages.
 *
 * Each page in the registry gets its own test.describe block named after
 * the page key (e.g. "financeiro-dashboard", "clientes", etc.).
 * This makes --grep filtering unambiguous:
 *
 *   --grep "financeiro"           → all financial pages  (18 tests)
 *   --grep "financeiro-dashboard" → only the dashboard   (3 tests)
 *   --grep "contas-a-receber"     → only that page       (3 tests)
 *
 * For each page × each preview state (populated, empty, error):
 *   1. Navigate to /dev-preview/[pageName]?state=[state]
 *   2. Wait for MSW to initialize (loading spinner disappears)
 *   3. Wait for any loading skeletons to resolve
 *   4. Take a full-page screenshot
 *
 * Screenshots saved to: tests/screenshots/output/[pageName]-[state].png
 *
 * Usage:
 *   npm run test:screenshots                              → all pages
 *   npm run test:screenshots -- --grep "financeiro"       → financial pages only
 *   npm run test:screenshots -- --grep "financeiro-dashboard" → single page
 */

const MSW_READY_TIMEOUT = 12_000;
const CONTENT_STABLE_TIMEOUT = 5_000;

async function capturePreviewPage(
  page: import("@playwright/test").Page,
  pageName: string,
  state: string,
) {
  const url = `/dev-preview/${pageName}?state=${state}`;
  await page.goto(url);

  // Wait for MockProvider loading spinner to disappear (MSW ready)
  await page
    .getByText("Initializing dev preview...")
    .waitFor({ state: "hidden", timeout: MSW_READY_TIMEOUT })
    .catch(() => {
      // Spinner may never appear if MSW loads fast — that's OK
    });

  // Wait for content to be visible (skeletons/spinners resolved)
  await page
    .locator('[class*="animate-spin"]')
    .first()
    .waitFor({ state: "hidden", timeout: CONTENT_STABLE_TIMEOUT })
    .catch(() => {});

  // Wait for skeleton screens to resolve if present
  await page
    .locator('[class*="animate-pulse"]')
    .first()
    .waitFor({ state: "hidden", timeout: CONTENT_STABLE_TIMEOUT })
    .catch(() => {});

  // Brief pause for any remaining async renders
  await page.waitForTimeout(500);

  // Take a full-page screenshot
  const screenshotName = `${pageName}-${state}.png`;
  await page.screenshot({
    path: `tests/screenshots/output/${screenshotName}`,
    fullPage: true,
  });

  // Basic health check: page should not show a Next.js error
  await expect(page.getByText("Application error")).not.toBeVisible();

  // The page body should have actual content rendered
  const bodyText = await page.locator("body").innerText();
  expect(bodyText.trim().length).toBeGreaterThan(0);
}

// One describe block per page — makes --grep unambiguous
for (const [pageName] of Object.entries(registry)) {
  test.describe(pageName, () => {
    for (const state of PREVIEW_STATES) {
      test(PREVIEW_STATE_LABELS[state], async ({ page }) => {
        await capturePreviewPage(page, pageName, state);
      });
    }
  });
}

/**
 * Index page test — verifies all registered pages are listed.
 * Wrapped in its own describe so --grep filters it correctly:
 *   --grep "dev-preview-index"  → only this test
 *   --grep "financeiro"          → skips this test
 */
test.describe("dev-preview-index", () => {
  test("lists all pages", async ({ page }) => {
    await page.goto("/dev-preview");

    // All registered page names should appear somewhere in the index
    for (const [pageName] of Object.entries(registry)) {
      // At minimum, the populated link should exist for each page
      await expect(
        page.locator(`a[href="/dev-preview/${pageName}?state=populated"]`)
      ).toBeVisible();
    }

    // Screenshot the index too
    await page.screenshot({
      path: "tests/screenshots/output/index.png",
      fullPage: true,
    });
  });
});
