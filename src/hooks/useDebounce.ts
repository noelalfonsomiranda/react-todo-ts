import { useEffect, useState } from 'react';

// =============================================================================
// useDebounce — delay a fast-changing value until it "settles"
// =============================================================================
// Debouncing: wait until the input has stopped changing for `delay` ms before
// using it. Typing "react" fires 5 keystrokes; with a 300ms debounce we
// filter once, after the user pauses — not 5 times. With a real search API
// this saves network requests; here it avoids needless re-filtering.
//
// TypeScript concept: generics. `<T>` means "whatever type you pass in, you
// get the same type back" — useDebounce('abc') returns string,
// useDebounce(42) returns number.
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // setTimeout schedules the update to happen `delay` ms from now.
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);

    // Cleanup runs before the next effect (i.e. on the next keystroke) and
    // on unmount. Clearing the pending timeout is what makes this a
    // debounce: each new keystroke cancels the previous scheduled update,
    // so only the LAST value (after the user pauses) is applied.
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
