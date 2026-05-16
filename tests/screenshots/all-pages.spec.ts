import { test, expect } from "@playwright/test";
import { registry, PREVIEW_STATES, PREVIEW_STATE_LABELS } from "../../src/app/dev-preview/registry";

/**
 * Automated visual screenshot tests for all dev-preview pages.
 *
 * For each page in the registry × each preview state (populated, empty, error):
 *   1. Navigate to /dev-preview/[pageName]?state=[state]
 *   2. Wait for MSW to initialize (loading spinner disappears)
 *   3. Wait for any loading skeletons to resolve
 *   4. Take a full-page screenshot
 *
 * Screenshots are saved to tests/screenshots/output/[pageName]-[state].png
 * and are intended for visual review by agents or developers — not pixel diffing.
 *
 * Usage: npm run test:screenshots
 */

const MSW_READY_TIMEOUT = 12_000;
const CONTENT_STABLE_TIMEOUT = 5_000;

test.describe("Dev Preview — All Pages", () => {
  for (const [pageName, entry] of Object.entries(registry)) {
    for (const state of PREVIEW_STATES) {
      const testName = `${pageName} / ${PREVIEW_STATE_LABELS[state]}`;

      test(testName, async ({ page }) => {
        // Navigate to the preview page with the desired state
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
          .catch(() => {
            // May not have any spinners — fine
          });

        // Wait for skeleton screens to resolve if present
        await page
          .locator('[class*="animate-pulse"]')
          .first()
          .waitFor({ state: "hidden", timeout: CONTENT_STABLE_TIMEOUT })
          .catch(() => {
            // May not have skeleton screens
          });

        // Brief pause for any remaining async renders
        await page.waitForTimeout(500);

        // Take a full-page screenshot
        const screenshotName = `${pageName}-${state}.png`;
        await page.screenshot({
          path: `tests/screenshots/output/${screenshotName}`,
          fullPage: true,
        });

        // Basic health check: page should not show a Next.js error
        const errorText = page.getByText("Application error");
        await expect(errorText).not.toBeVisible();

        // The page body should have actual content rendered
        const bodyText = await page.locator("body").innerText();
        expect(bodyText.trim().length).toBeGreaterThan(0);
      });
    }
  }
});

/**
 * Index page test — verifies all registered pages are listed
 */
test("Dev Preview index lists all pages", async ({ page }) => {
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
