"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { parseServiceDescription } from "@/lib/service-description";
import { cn } from "@/lib/utils";

type ServiceDescriptionProps = {
  description?: string | null;
  className?: string;
  introClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  toggleClassName?: string;
  maxItemsCollapsed?: number;
  defaultExpanded?: boolean;
  showToggle?: boolean;
};

export function ServiceDescription({
  description,
  className,
  introClassName,
  listClassName,
  itemClassName,
  toggleClassName,
  maxItemsCollapsed = 3,
  defaultExpanded = false,
  showToggle = true,
}: ServiceDescriptionProps) {
  const parsed = useMemo(
    () => parseServiceDescription(description ?? ""),
    [description],
  );
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [description, defaultExpanded]);

  if (!parsed.intro && parsed.items.length === 0) {
    return null;
  }

  const hasHiddenItems = parsed.items.length > maxItemsCollapsed;
  const hasLongIntro = parsed.intro ? parsed.intro.length > 140 : false;
  const needsToggle = hasHiddenItems || hasLongIntro;
  const shouldShowToggle = showToggle && needsToggle;
  const visibleItems = expanded
    ? parsed.items
    : parsed.items.slice(0, maxItemsCollapsed);

  return (
    <div className={cn("space-y-1", className)}>
      {parsed.intro && (
        <p
          className={cn(
            "text-sm font-medium text-foreground/90",
            !expanded && "line-clamp-2",
            introClassName,
          )}
        >
          {parsed.intro}
        </p>
      )}

      {visibleItems.length > 0 && (
        <ul className={cn("space-y-1", parsed.intro && "mt-2", listClassName)}>
          {visibleItems.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className={cn("flex items-start gap-1.5", itemClassName)}
            >
              <Check className="mt-1 h-3.5 w-3.5 text-green-500" />
              <span className={cn(!expanded && "line-clamp-1", "text-sm")}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}

      {shouldShowToggle && (
        <button
          type="button"
          aria-expanded={expanded}
          className={cn(
            "text-xs text-muted-foreground hover:underline",
            toggleClassName,
          )}
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded(prev => !prev);
          }}
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </div>
  );
}
