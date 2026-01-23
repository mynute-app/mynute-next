"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGetCompany } from "@/hooks/get-company";

type ThemeColors = {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  quaternary?: string;
};

const FALLBACK_COLORS: Required<ThemeColors> = {
  primary: "#0b0b0b",
  secondary: "#f59e0b",
  tertiary: "#22c55e",
  quaternary: "#6366f1",
};

const THEME_KEYS = [
  "--brand-primary",
  "--brand-primary-hover",
  "--brand-primary-glow",
  "--brand-primary-foreground",
  "--brand-secondary",
  "--brand-secondary-hover",
  "--brand-secondary-foreground",
  "--brand-tertiary",
  "--brand-quaternary",
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeHex = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  const trimmed = value.trim();
  const match = trimmed.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match) return fallback;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

const hexToHsl = (hex: string) => {
  let normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map(char => char + char)
      .join("");
  }

  const num = Number.parseInt(normalized, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const formatHsl = (value: { h: number; s: number; l: number }) =>
  `${value.h} ${value.s}% ${value.l}%`;

const adjustLightness = (value: { h: number; s: number; l: number }, amount: number) => ({
  h: value.h,
  s: value.s,
  l: clamp(value.l + amount, 0, 100),
});

const pickForeground = (value: { l: number }) =>
  value.l >= 60 ? "0 0% 10%" : "0 0% 100%";

const buildThemeVars = (colors?: ThemeColors) => {
  const primary = hexToHsl(
    normalizeHex(colors?.primary, FALLBACK_COLORS.primary)
  );
  const secondary = hexToHsl(
    normalizeHex(colors?.secondary, FALLBACK_COLORS.secondary)
  );
  const tertiary = hexToHsl(
    normalizeHex(colors?.tertiary, FALLBACK_COLORS.tertiary)
  );
  const quaternary = hexToHsl(
    normalizeHex(colors?.quaternary, FALLBACK_COLORS.quaternary)
  );

  const primaryHover = adjustLightness(
    primary,
    primary.l >= 60 ? -8 : 8
  );
  const primaryGlow = adjustLightness(
    primary,
    primary.l >= 70 ? -12 : 16
  );
  const secondaryHover = adjustLightness(
    secondary,
    secondary.l >= 60 ? -8 : 8
  );

  return {
    "--brand-primary": formatHsl(primary),
    "--brand-primary-hover": formatHsl(primaryHover),
    "--brand-primary-glow": formatHsl(primaryGlow),
    "--brand-primary-foreground": pickForeground(primary),
    "--brand-secondary": formatHsl(secondary),
    "--brand-secondary-hover": formatHsl(secondaryHover),
    "--brand-secondary-foreground": pickForeground(secondary),
    "--brand-tertiary": formatHsl(tertiary),
    "--brand-quaternary": formatHsl(quaternary),
  };
};

export function DashboardTheme({ children }: { children: React.ReactNode }) {
  const { company } = useGetCompany();
  const initialValuesRef = useRef<Map<string, string> | null>(null);

  const themeVars = useMemo(
    () => buildThemeVars(company?.design?.colors),
    [
      company?.design?.colors?.primary,
      company?.design?.colors?.secondary,
      company?.design?.colors?.tertiary,
      company?.design?.colors?.quaternary,
    ]
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dashboard-theme");

    const initialValues = new Map<string, string>();
    THEME_KEYS.forEach(key => {
      initialValues.set(key, root.style.getPropertyValue(key));
    });
    initialValuesRef.current = initialValues;

    return () => {
      const stored = initialValuesRef.current;
      if (stored) {
        stored.forEach((value, key) => {
          if (value) {
            root.style.setProperty(key, value);
          } else {
            root.style.removeProperty(key);
          }
        });
      }
      root.classList.remove("dashboard-theme");
      initialValuesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [themeVars]);

  return <>{children}</>;
}
