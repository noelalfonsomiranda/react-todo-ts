import { useContext } from 'react';
import { TodoContext } from '../context/TodoContext';
import type { TodoContextValue } from '../types/todo';

// =============================================================================
// useTodos — the one way components access Todo state and actions
// =============================================================================
// React concept: Custom hook
// A custom hook is just a function whose name starts with `use` and that
// calls other hooks. It lets us package reusable stateful logic.
//
// Why components use this instead of useContext(TodoContext) directly:
//   1. Safety: it throws a clear error if a component is rendered outside
//      <TodoProvider>, instead of failing later with "cannot read X of null".
//   2. Type narrowing: callers get `TodoContextValue`, never `null`.
//   3. Encapsulation: components don't know Context exists. If we later move
//      to Zustand/Redux/React Query, only this hook changes.
//
// Usage:
//   const { todos, loading, addTodo, toggleSubTodo } = useTodos();
export function useTodos(): TodoContextValue {
  // React concept: useContext
  // Reads the nearest <TodoContext> value above this component in the tree.
  // The component re-renders whenever that value changes.
  const context = useContext(TodoContext);

  if (context === null) {
    throw new Error('useTodos must be used inside a <TodoProvider>');
  }

  return context;
}
