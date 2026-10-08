// =============================================================================
// Domain types
// =============================================================================
// TypeScript concept: `interface` vs `type`
// Interfaces describe object shapes and can be extended. `type` aliases are
// needed for unions (e.g. TodoFilter, TodoAction). Both work for objects;
// a common convention is "interface for objects, type for everything else".

export interface SubTodo {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  subTodos: SubTodo[];
  // ISO 8601 strings (not Date objects) because that is what JSON gives us,
  // and strings are trivially serialisable if we ever add persistence.
  createdAt: string;
  updatedAt: string;
}

// TypeScript concept: string literal union
// Only these three values are allowed. Typos like 'complete' become compile
// errors, and editors can autocomplete the options.
export type TodoFilter = 'all' | 'active' | 'completed';

// =============================================================================
// State + actions for the reducer
// =============================================================================

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

// TypeScript concept: discriminated union
// Every action has a literal `type` field (the "discriminant"). Inside a
// `switch (action.type)`, TypeScript narrows `action` to the matching member,
// so `action.payload` has the correct shape in each case. Dispatching an
// action with the wrong payload is a compile-time error.
export type TodoAction =
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: { id: string; title: string; updatedAt: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string; updatedAt: string } }
  | { type: 'ADD_SUB_TODO'; payload: { todoId: string; subTodo: SubTodo; updatedAt: string } }
  | {
      type: 'UPDATE_SUB_TODO';
      payload: { todoId: string; subTodoId: string; title: string; updatedAt: string };
    }
  | { type: 'DELETE_SUB_TODO'; payload: { todoId: string; subTodoId: string; updatedAt: string } }
  | { type: 'TOGGLE_SUB_TODO'; payload: { todoId: string; subTodoId: string; updatedAt: string } };

// =============================================================================
// Context value
// =============================================================================
// This is the "public API" of the Todo feature. Components only see these
// fields/functions — they never see `dispatch` or the action objects.
export interface TodoContextValue {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  addTodo: (title: string) => void;
  updateTodo: (id: string, title: string) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  addSubTodo: (todoId: string, title: string) => void;
  updateSubTodo: (todoId: string, subTodoId: string, title: string) => void;
  deleteSubTodo: (todoId: string, subTodoId: string) => void;
  toggleSubTodo: (todoId: string, subTodoId: string) => void;
}

// =============================================================================
// Form values
// =============================================================================
// Typing form values lets Ant Design's `Form<T>` / `onFinish(values: T)`
// give us autocomplete and catch mismatched field names.
export interface TodoFormValues {
  title: string;
}

export interface SubTodoFormValues {
  title: string;
}
