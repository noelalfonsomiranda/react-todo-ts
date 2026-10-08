import type { Todo } from '../types/todo';

// =============================================================================
// API layer
// =============================================================================
// Why a separate file: components should not know *where* data comes from.
// Today it is a static JSON file; tomorrow it could be a REST endpoint.
// Only this file would need to change.
//
// This is the ONLY network call in the app (GET /todos.json). All edits
// happen in React memory, so refreshing the page restores the original data.

export async function fetchTodos(): Promise<Todo[]> {
  // `fetch()` returns a Promise that resolves to a Response once the HTTP
  // headers arrive. `await` pauses this async function until that happens.
  // Files in /public are served from the site root, hence '/todos.json'.
  const response = await fetch('/todos.json');

  // Important: fetch only REJECTS on network failure (offline, DNS, CORS).
  // A 404 or 500 still RESOLVES — so we must check `response.ok`
  // (true for status 200–299) ourselves and throw for anything else.
  if (!response.ok) {
    throw new Error(`Failed to load todos (HTTP ${response.status})`);
  }

  // `response.json()` is also async: the body is a stream that has to be
  // fully read and then parsed. It returns a Promise of the parsed value.
  //
  // TypeScript note: `json()` returns `Promise<any>`. Annotating the result
  // as Todo[] is a *trust* assertion — TS does not validate it at runtime.
  // In a real app you might validate with a schema library (e.g. zod).
  const data: Todo[] = await response.json();
  return data;
}
