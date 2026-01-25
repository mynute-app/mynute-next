export type ParsedServiceDescription = {
  intro: string | null;
  items: string[];
  raw: string;
};

const BULLET_PREFIX = /^\s*([-*]|\u2022)\s+/;

export function stripDescriptionBullet(line: string): string {
  return line.replace(BULLET_PREFIX, "").trim();
}

export function parseServiceDescription(
  rawInput: string | string[] | null | undefined,
): ParsedServiceDescription {
  const safeInput = Array.isArray(rawInput)
    ? rawInput.join("\n")
    : rawInput == null
      ? ""
      : String(rawInput);
  const raw = safeInput.trim();
  if (!raw) {
    return { intro: null, items: [], raw: "" };
  }

  const rawLines = safeInput.split(/\r?\n/);
  const trimmedLines = rawLines.map(line => line.trim());
  const firstBulletIndex = trimmedLines.findIndex(line =>
    BULLET_PREFIX.test(line),
  );
  const firstBlankIndex = trimmedLines.findIndex(line => line.length === 0);

  if (firstBulletIndex >= 0) {
    const introLines = trimmedLines
      .slice(0, firstBulletIndex)
      .filter(Boolean);
    const itemLines = trimmedLines.slice(firstBulletIndex).filter(Boolean);

    return {
      intro: introLines.length > 0 ? introLines.join(" ") : null,
      items: itemLines.map(stripDescriptionBullet).filter(Boolean),
      raw: safeInput,
    };
  }

  if (firstBlankIndex >= 0) {
    const introLines = trimmedLines
      .slice(0, firstBlankIndex)
      .filter(Boolean);
    const itemLines = trimmedLines.slice(firstBlankIndex + 1).filter(Boolean);

    if (itemLines.length > 0) {
      return {
        intro: introLines.length > 0 ? introLines.join(" ") : null,
        items: itemLines.map(stripDescriptionBullet).filter(Boolean),
        raw: safeInput,
      };
    }
  }

  const nonEmptyLines = trimmedLines.filter(Boolean);
  if (nonEmptyLines.length <= 1) {
    return {
      intro: nonEmptyLines[0] ?? null,
      items: [],
      raw: safeInput,
    };
  }

  return {
    intro: null,
    items: nonEmptyLines.map(stripDescriptionBullet).filter(Boolean),
    raw: safeInput,
  };
}

export function serializeServiceDescription(
  intro: string | null | undefined,
  items: string[],
): string {
  const introText = (intro ?? "").trim();
  const cleanedItems = items
    .map(stripDescriptionBullet)
    .map(item => item.trim())
    .filter(Boolean);

  if (!introText && cleanedItems.length === 0) {
    return "";
  }

  if (!introText) {
    return cleanedItems.map(item => `- ${item}`).join("\n");
  }

  if (cleanedItems.length === 0) {
    return introText;
  }

  return `${introText}\n\n${cleanedItems.map(item => `- ${item}`).join("\n")}`;
}

export function normalizeServiceDescription(
  rawInput: string | null | undefined,
): string {
  const parsed = parseServiceDescription(rawInput);
  return serializeServiceDescription(parsed.intro, parsed.items);
}
