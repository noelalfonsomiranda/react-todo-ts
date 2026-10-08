import type { Todo, TodoFilter } from '../types/todo';

// =============================================================================
// Pure utility functions
// =============================================================================
// A *pure function* always returns the same output for the same input and has
// no side effects (no fetch, no mutation, no Date.now()). Pure functions are:
//   - trivial to unit test (see tests/utils/todoUtils.test.ts)
//   - safe to call inside useMemo and reducers
//   - easy to reason about in interviews ("data in, data out")

/** Keep only todos whose title contains the search term (case-insensitive). */
export function searchTodos(todos: Todo[], searchTerm: string): Todo[] {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return todos;
  return todos.filter((todo) => todo.title.toLowerCase().includes(term));
}

/** Apply the status filter, then the search term. Returns a NEW array. */
export function filterTodos(todos: Todo[], filter: TodoFilter, searchTerm = ''): Todo[] {
  // Array.prototype.filter never mutates the original array — it returns
  // a new one. That matters because `todos` is React state.
  const byStatus = todos.filter((todo) => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      case 'all':
        return true;
    }
  });
  return searchTodos(byStatus, searchTerm);
}

export function getCompletedSubTodoCount(todo: Todo): number {
  return todo.subTodos.filter((sub) => sub.completed).length;
}

export function getTotalSubTodoCount(todo: Todo): number {
  return todo.subTodos.length;
}

/** Percentage (0–100) of completed sub-todos. A todo with none returns 0. */
export function getTodoProgress(todo: Todo): number {
  const total = getTotalSubTodoCount(todo);
  if (total === 0) return 0;
  return Math.round((getCompletedSubTodoCount(todo) / total) * 100);
}

/** Human-friendly date for display, e.g. "8 Oct 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
