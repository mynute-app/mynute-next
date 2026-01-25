"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  parseServiceDescription,
  serializeServiceDescription,
  stripDescriptionBullet,
} from "@/lib/service-description";

type ServiceDescriptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  introLabel?: string;
  itemsLabel?: string;
  introPlaceholder?: string;
  itemsPlaceholder?: string;
  error?: string;
};

export function ServiceDescriptionEditor({
  value,
  onChange,
  className,
  introLabel = "Resumo (opcional)",
  itemsLabel = "Itens do pacote",
  introPlaceholder = "Ex: Combina brilho, protecao e cuidado interno e externo.",
  itemsPlaceholder = "Um item por linha",
  error,
}: ServiceDescriptionEditorProps) {
  const initialParsed = parseServiceDescription(value);
  const [intro, setIntro] = useState(initialParsed.intro ?? "");
  const [itemsText, setItemsText] = useState(
    initialParsed.items.join("\n"),
  );
  const lastSerializedRef = useRef<string>(value ?? "");

  useEffect(() => {
    const nextValue = value ?? "";
    if (nextValue === lastSerializedRef.current) {
      return;
    }

    const parsed = parseServiceDescription(nextValue);
    setIntro(parsed.intro ?? "");
    setItemsText(parsed.items.join("\n"));
    lastSerializedRef.current = nextValue;
  }, [value]);

  const commit = (nextIntro: string, nextItemsText: string) => {
    setIntro(nextIntro);
    setItemsText(nextItemsText);

    const items = nextItemsText
      .split(/\r?\n/)
      .map(stripDescriptionBullet)
      .map(item => item.trim())
      .filter(Boolean);

    const serialized = serializeServiceDescription(nextIntro, items);
    lastSerializedRef.current = serialized;
    onChange(serialized);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="service-description-intro">{introLabel}</Label>
        <Textarea
          id="service-description-intro"
          rows={2}
          value={intro}
          onChange={event => commit(event.target.value, itemsText)}
          placeholder={introPlaceholder}
        />
        <p className="text-xs text-muted-foreground">
          Texto curto que aparece antes da lista.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-description-items">{itemsLabel}</Label>
        <Textarea
          id="service-description-items"
          rows={5}
          value={itemsText}
          onChange={event => commit(intro, event.target.value)}
          placeholder={itemsPlaceholder}
        />
        <p className="text-xs text-muted-foreground">
          Cada linha vira um topico no agendamento.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
