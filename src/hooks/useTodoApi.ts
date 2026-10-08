import { useEffect, useState, type Dispatch } from 'react';
import { fetchTodos } from '../api/todoApi';
import type { TodoAction } from '../types/todo';

// =============================================================================
// useTodoApi — loads the initial todos and feeds them into the reducer
// =============================================================================
// Why a custom hook: the Provider shouldn't care HOW data is loaded. This hook
// owns the fetch lifecycle (loading → success | error) and talks to the
// reducer only through `dispatch`. Swap the JSON file for a real API and
// nothing outside this hook (and todoApi.ts) needs to change.
//
// State flow:
//   Initial (loading: true)
//     ↓
//   effect runs → SET_LOADING(true) → fetchTodos()
//     ├── success → SET_TODOS(data)  → todos render
//     └── failure → SET_ERROR(msg)   → <ErrorState> with Retry
//                                         ↓ Retry clicked
//                                       reload() → effect runs again

export function useTodoApi(dispatch: Dispatch<TodoAction>) {
  // Local state used only as a "trigger": bumping it re-runs the effect.
  // This is how Retry works without duplicating the fetch logic.
  const [requestId, setRequestId] = useState(0);

  // React concept: useEffect
  // A *side effect* is anything that reaches outside React's render
  // calculation: network requests, timers, subscriptions, DOM APIs.
  // Rendering must be pure, so side effects go in useEffect, which runs
  // AFTER React has committed the render to the screen.
  //
  // Dependency array:
  //   - no array      → runs after every render
  //   - []            → runs once after the first render (mount)
  //   - [a, b]        → runs on mount and whenever a or b changes
  //
  // Here: `dispatch` from useReducer is guaranteed stable (never changes),
  // so in practice this behaves like `[]` — it runs once on mount — plus
  // again whenever `requestId` changes (i.e. the user clicks Retry).
  useEffect(() => {
    // Guard against race conditions / unmounted components.
    // If the effect is cleaned up before the fetch finishes (component
    // unmounted, or a newer request started), we ignore the stale result.
    // In development, React StrictMode intentionally mounts → unmounts →
    // remounts, so this guard also prevents a double-dispatch.
    let ignore = false;

    async function loadTodos() {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const todos = await fetchTodos();
        if (!ignore) dispatch({ type: 'SET_TODOS', payload: todos });
      } catch (err) {
        // TypeScript: a caught value is `unknown` (it could be anything that
        // was thrown), so we narrow it before reading `.message`.
        const message = err instanceof Error ? err.message : 'Something went wrong';
        if (!ignore) dispatch({ type: 'SET_ERROR', payload: message });
      }
    }

    loadTodos();

    // Cleanup function: React calls this before re-running the effect
    // and when the component unmounts.
    return () => {
      ignore = true;
    };
  }, [dispatch, requestId]);

  return {
    reload: () => setRequestId((id) => id + 1),
  };
}
