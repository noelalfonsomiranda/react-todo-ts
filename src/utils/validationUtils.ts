import type { FormRule } from 'antd';

// Single source of truth for validation limits so forms and tests agree.
export const TODO_TITLE_MAX_LENGTH = 100;
export const SUB_TODO_TITLE_MAX_LENGTH = 80;

/**
 * Builds Ant Design validation rules for a "title" field.
 *
 * - `required` + `whitespace: true` rejects empty AND whitespace-only input
 *   ("   " would otherwise pass a plain required check).
 * - `max` limits length. The form also trims the value on submit (see the
 *   form components), so leading/trailing spaces never reach state.
 */
export function titleRules(label: string, maxLength: number): FormRule[] {
  return [
    { required: true, whitespace: true, message: `${label} is required` },
    { max: maxLength, message: `${label} must be ${maxLength} characters or fewer` },
  ];
}

/** Normalise user input before it goes into state. */
export function normalizeTitle(value: string): string {
  return value.trim();
}
