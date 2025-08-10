"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

type Suggestion = {
  description: string;
  place_id: string;
};

export default function AddressAutocomplete({
  id,
  value,
  placeholder,
  onChange,
  onSelect,
  error,
  className,
}: {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelect: (s: Suggestion) => void;
  error?: string;
  className?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionTokenRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch suggestions (debounced)
  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "places-autocomplete",
          {
            body: {
              input: value,
              sessionToken: sessionTokenRef.current,
            },
            headers: { "Content-Type": "application/json" },
          }
        );
        if (fnError) throw fnError;
        type GooglePrediction = { description: string; place_id: string };
        const preds: Suggestion[] = (
          (data?.predictions || []) as GooglePrediction[]
        ).map((p) => ({
          description: p.description,
          place_id: p.place_id,
        }));
        setSuggestions(preds);
        setOpen(preds.length > 0);
      } catch {
        // Swallow errors; keep UX responsive
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [value, supabase]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        const sel = suggestions[highlightIndex];
        onSelect(sel);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={boxRef}>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() =>
          value.trim().length >= 3 && suggestions.length > 0 && setOpen(true)
        }
        onKeyDown={handleKeyDown}
        className={`${className || ""} ${error ? "border-red-500" : ""}`}
        autoComplete="off"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black/5 max-h-64 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No results</div>
          ) : (
            <ul>
              {suggestions.map((s, idx) => (
                <li
                  key={s.place_id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                    idx === highlightIndex ? "bg-gray-50" : ""
                  }`}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(s);
                    setOpen(false);
                  }}
                >
                  {s.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
