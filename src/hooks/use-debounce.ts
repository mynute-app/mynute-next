import { useEffect, useState } from "react";

/**
 * Debounces a value by the given delay (ms).
 * Returns the debounced value, which only updates after the delay
 * has elapsed since the last change.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
