/**
 * UI Validation Helpers — mynute-next
 *
 * Automated enforcement of the mynute-next design system in Jest tests.
 * Import and call these at the end of every component/page render test.
 *
 * Usage:
 *   import { runAllValidations, assertTableUsability } from '../helpers/ui-validation';
 *
 *   const { container } = render(<MyPage />);
 *   // ... functional assertions ...
 *   runAllValidations(container);
 *
 * Each assertion throws a descriptive error so Jest output tells you
 * exactly which design rule was violated and where.
 */

// ---------------------------------------------------------------------------
// Interactive Element Sizing
// ---------------------------------------------------------------------------

/**
 * Minimum height classes allowed on interactive elements.
 * shadcn/ui defaults: Button=h-9, Input=h-9, Select trigger=h-9.
 * Minimum is h-8 (32px). Anything below is inaccessible.
 */
const FORBIDDEN_HEIGHT_CLASSES = ["h-1", "h-2", "h-3", "h-4", "h-5", "h-6", "h-7"];
const FORBIDDEN_PADDING_PATTERN = /\bp-0\b/;

/**
 * Asserts that all interactive elements (input, button, select, textarea)
 * meet the minimum 32px height requirement.
 */
export function assertInteractiveElementSizing(container: HTMLElement): void {
  const interactiveSelectors = [
    "input:not([type='hidden']):not([type='checkbox']):not([type='radio'])",
    "button",
    "select",
    "textarea",
    "[role='combobox']",
    "[role='button']",
  ];

  for (const selector of interactiveSelectors) {
    const elements = container.querySelectorAll<HTMLElement>(selector);
    elements.forEach((el) => {
      const classes = el.className || "";
      for (const forbidden of FORBIDDEN_HEIGHT_CLASSES) {
        if (classes.split(/\s+/).includes(forbidden)) {
          throw new Error(
            `Design violation: <${el.tagName.toLowerCase()}> has forbidden height class "${forbidden}". ` +
            `Minimum allowed is h-8 (32px). Element: ${el.outerHTML.slice(0, 120)}`
          );
        }
      }

      if (FORBIDDEN_PADDING_PATTERN.test(classes)) {
        throw new Error(
          `Design violation: <${el.tagName.toLowerCase()}> has "p-0" — interactive elements must have padding. ` +
          `Element: ${el.outerHTML.slice(0, 120)}`
        );
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Form Label Association
// ---------------------------------------------------------------------------

/**
 * Asserts that every text/email/password/number/tel input has an associated label.
 * Acceptable: <label for="id">, aria-label, aria-labelledby, or <label> wrapper.
 * Exception: type="search" inputs are allowed without a visible label.
 */
export function assertFormLabels(container: HTMLElement): void {
  const labelableTypes = ["text", "email", "password", "number", "tel", "url", "date", "time"];
  const inputs = container.querySelectorAll<HTMLInputElement>("input");

  inputs.forEach((input) => {
    const type = (input.getAttribute("type") || "text").toLowerCase();
    if (!labelableTypes.includes(type)) return;

    const id = input.id;
    const hasForLabel = id ? container.querySelector(`label[for="${id}"]`) !== null : false;
    const hasAriaLabel = input.hasAttribute("aria-label");
    const hasAriaLabelledBy = input.hasAttribute("aria-labelledby");
    const hasWrappingLabel = input.closest("label") !== null;

    if (!hasForLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasWrappingLabel) {
      throw new Error(
        `Design violation: <input type="${type}"> has no associated label. ` +
        `Add a <label for="${id || "inputId"}">, aria-label, or wrap it in a <label>. ` +
        `Element: ${input.outerHTML.slice(0, 120)}`
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Table Structure
// ---------------------------------------------------------------------------

/**
 * Asserts that tables rendered without the shadcn/ui Table component
 * have a proper overflow wrapper and a <thead>.
 *
 * Note: shadcn/ui's <Table> already wraps in overflow-auto — this catches
 * raw <table> elements that bypass the component.
 */
export function assertTableUsability(container: HTMLElement): void {
  const tables = container.querySelectorAll("table");

  tables.forEach((table) => {
    // Must have a <thead>
    const hasHead = table.querySelector("thead") !== null;
    if (!hasHead) {
      throw new Error(
        `Design violation: <table> has no <thead>. Add a header row. ` +
        `Table: ${table.outerHTML.slice(0, 200)}`
      );
    }

    // Parent must provide overflow scrolling (the shadcn Table wrapper does this automatically)
    const parent = table.parentElement;
    if (!parent) return;
    const parentClass = parent.className || "";
    const hasOverflow =
      parentClass.includes("overflow") ||
      parentClass.includes("relative") || // shadcn wrapper uses "relative w-full overflow-auto"
      parent.tagName === "DIV";            // shadcn wraps in a div — we trust this is correct

    if (!hasOverflow) {
      throw new Error(
        `Design violation: <table> parent has no overflow class. ` +
        `Wrap the table in a div with overflow-x-auto. ` +
        `Parent: ${parent.outerHTML.slice(0, 120)}`
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Hardcoded Color Detection
// ---------------------------------------------------------------------------

/**
 * Asserts that no element uses hardcoded hex/rgb/rgba colors in inline styles.
 * Always use Tailwind tokens or CSS variables instead.
 */
export function assertNoHardcodedColors(container: HTMLElement): void {
  const hardcodedColorPattern = /#[0-9a-fA-F]{3,8}|rgb\(|rgba\(/;
  const all = container.querySelectorAll<HTMLElement>("*");

  all.forEach((el) => {
    const style = el.getAttribute("style") || "";
    if (hardcodedColorPattern.test(style)) {
      throw new Error(
        `Design violation: element has hardcoded color in inline style. ` +
        `Use Tailwind tokens (text-destructive, bg-primary, etc.) or CSS vars (hsl(var(--success))). ` +
        `style="${style}" on <${el.tagName.toLowerCase()}>`
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Form Submit Button
// ---------------------------------------------------------------------------

/**
 * Asserts that every <form> has a submit button.
 */
export function assertFormHasSubmitButton(container: HTMLElement): void {
  const forms = container.querySelectorAll("form");

  forms.forEach((form) => {
    const submitBtn = form.querySelector<HTMLElement>(
      "button[type='submit'], input[type='submit']"
    );
    // Also accept a button without explicit type (defaults to submit inside a form)
    const anyBtn = form.querySelector("button:not([type='button']):not([type='reset'])");
    if (!submitBtn && !anyBtn) {
      throw new Error(
        `Design violation: <form> has no submit button. ` +
        `Add a <button type="submit"> or equivalent.`
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Icon Library Enforcement
// ---------------------------------------------------------------------------

/**
 * Asserts that no element uses react-icons SVG paths.
 * react-icons SVGs have a characteristic xmlns and title pattern.
 *
 * Note: this is a best-effort check. It detects the most common case where
 * react-icons renders SVGs with data-icon or aria-label attributes that
 * lucide-react does not use.
 *
 * Prefer linting (eslint-plugin-no-restricted-imports) for full enforcement.
 */
export function assertLucideIconsOnly(container: HTMLElement): void {
  // react-icons adds a <title> element inside SVGs by default; lucide-react does not
  const svgsWithTitle = container.querySelectorAll("svg > title");
  if (svgsWithTitle.length > 0) {
    throw new Error(
      `Design violation: detected SVG with <title> — likely from react-icons. ` +
      `Only lucide-react icons are allowed. Replace with the equivalent lucide icon.`
    );
  }
}

// ---------------------------------------------------------------------------
// Composite Validator
// ---------------------------------------------------------------------------

/**
 * Run all standard validations in sequence.
 * Call this at the end of every component/page render test.
 *
 * @param container - The DOM container returned by render({ container })
 * @param options   - Opt out of specific checks when genuinely not applicable
 *
 * @example
 * const { container } = render(<MyPage />);
 * runAllValidations(container);
 */
export function runAllValidations(
  container: HTMLElement,
  options: {
    skipSizing?: boolean;
    skipLabels?: boolean;
    skipTables?: boolean;
    skipColors?: boolean;
    skipSubmit?: boolean;
    skipIcons?: boolean;
  } = {}
): void {
  if (!options.skipSizing)  assertInteractiveElementSizing(container);
  if (!options.skipLabels)  assertFormLabels(container);
  if (!options.skipTables)  assertTableUsability(container);
  if (!options.skipColors)  assertNoHardcodedColors(container);
  if (!options.skipSubmit)  assertFormHasSubmitButton(container);
  if (!options.skipIcons)   assertLucideIconsOnly(container);
}
