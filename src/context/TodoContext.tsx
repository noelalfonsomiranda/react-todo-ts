import { createContext, useReducer, type ReactNode } from 'react';
import { useTodoApi } from '../hooks/useTodoApi';
import type { SubTodo, Todo, TodoAction, TodoContextValue, TodoState } from '../types/todo';

// =============================================================================
// 1. Reducer
// =============================================================================
// A reducer is a function: (currentState, action) => nextState.
//
// It MUST be pure:
//   - No side effects: no fetch, no console logging business logic,
//     no crypto.randomUUID(), no new Date(). Anything random or time-based
//     is created *before* dispatching and passed in via the payload.
//   - No mutation: never change `state` or anything inside it. Always
//     return new objects/arrays for whatever changed.
//
// Why purity matters:
//   - React may call reducers more than once (StrictMode does this on
//     purpose in development to surface impure reducers).
//   - Given the same state + action, you always get the same result, which
//     makes the reducer trivial to unit test (tests/context/todoReducer.test.ts).
//
// Why immutability matters:
//   React decides whether to re-render by comparing the old and new state
//   with Object.is() — a *reference* check, not a deep comparison.
//   If we did `state.todos.push(todo); return state;` the reference is
//   unchanged, so React thinks nothing happened and the UI goes stale.
//   Creating new arrays/objects gives React a new reference to detect.

export const initialTodoState: TodoState = {
  todos: [],
  // Start as `true`: the very first render already knows a fetch is coming,
  // so we show a spinner instead of briefly flashing the "empty" state.
  loading: true,
  error: null,
};

// Helper for nested updates: produce a new todos array where only the todo
// with `id` is replaced by `update(todo)`. Every other todo keeps its
// original reference, so React (and React.memo, if used) can tell they
// did not change.
function updateTodoById(todos: Todo[], id: string, update: (todo: Todo) => Todo): Todo[] {
  return todos.map((todo) => (todo.id === id ? update(todo) : todo));
}

// Same idea, one level deeper, for sub-todos.
function updateSubTodoById(
  subTodos: SubTodo[],
  id: string,
  update: (subTodo: SubTodo) => SubTodo,
): SubTodo[] {
  return subTodos.map((sub) => (sub.id === id ? update(sub) : sub));
}

export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  // TypeScript narrows `action` in each `case` thanks to the discriminated
  // union in types/todo.ts — e.g. inside 'ADD_TODO', action.payload is Todo.
  switch (action.type) {
    // ----- Loading lifecycle ------------------------------------------------
    // Initial → SET_LOADING(true) → fetch → SET_TODOS (success)
    //                                     → SET_ERROR (failure)
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: action.payload ? null : state.error };

    case 'SET_TODOS':
      return { ...state, todos: action.payload, loading: false, error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    // ----- Todo CRUD --------------------------------------------------------
    case 'ADD_TODO':
      // Spread creates a NEW array: [new, ...old]. Newest todo appears first.
      // (Never `state.todos.unshift(...)` — that mutates.)
      return { ...state, todos: [action.payload, ...state.todos] };

    case 'UPDATE_TODO': {
      const { id, title, updatedAt } = action.payload;
      return {
        ...state,
        // `{ ...todo, title }` copies the todo then overrides `title`.
        todos: updateTodoById(state.todos, id, (todo) => ({ ...todo, title, updatedAt })),
      };
    }

    case 'DELETE_TODO':
      // `filter` returns a new array without the matching todo.
      return { ...state, todos: state.todos.filter((todo) => todo.id !== action.payload.id) };

    case 'TOGGLE_TODO': {
      const { id, updatedAt } = action.payload;
      return {
        ...state,
        todos: updateTodoById(state.todos, id, (todo) => ({
          ...todo,
          completed: !todo.completed,
          updatedAt,
        })),
      };
    }

    // ----- SubTodo CRUD (nested immutable updates) --------------------------
    // To change one sub-todo we must create new copies along the whole path:
    //   new state → new todos array → new parent todo → new subTodos array
    //   → new sub-todo
    // Everything NOT on that path is reused as-is.
    case 'ADD_SUB_TODO': {
      const { todoId, subTodo, updatedAt } = action.payload;
      return {
        ...state,
        todos: updateTodoById(state.todos, todoId, (todo) => ({
          ...todo,
          // NOT todo.subTodos.push(subTodo) — that would mutate state.
          subTodos: [...todo.subTodos, subTodo],
          updatedAt,
        })),
      };
    }

    case 'UPDATE_SUB_TODO': {
      const { todoId, subTodoId, title, updatedAt } = action.payload;
      return {
        ...state,
        todos: updateTodoById(state.todos, todoId, (todo) => ({
          ...todo,
          subTodos: updateSubTodoById(todo.subTodos, subTodoId, (sub) => ({ ...sub, title })),
          updatedAt,
        })),
      };
    }

    case 'DELETE_SUB_TODO': {
      const { todoId, subTodoId, updatedAt } = action.payload;
      return {
        ...state,
        todos: updateTodoById(state.todos, todoId, (todo) => ({
          ...todo,
          subTodos: todo.subTodos.filter((sub) => sub.id !== subTodoId),
          updatedAt,
        })),
      };
    }

    case 'TOGGLE_SUB_TODO': {
      const { todoId, subTodoId, updatedAt } = action.payload;
      return {
        ...state,
        todos: updateTodoById(state.todos, todoId, (todo) => ({
          ...todo,
          subTodos: updateSubTodoById(todo.subTodos, subTodoId, (sub) => ({
            ...sub,
            completed: !sub.completed,
          })),
          updatedAt,
        })),
      };
    }

    default: {
      // TypeScript concept: exhaustiveness check.
      // If every action type is handled above, `action` has type `never` here.
      // Add a new action to TodoAction without handling it and this line
      // becomes a compile error — the compiler reminds you to update the reducer.
      const unhandled: never = action;
      return unhandled;
    }
  }
}

// =============================================================================
// 2. Context
// =============================================================================
// React concept: Context API
// Why: Todo state is needed by many components at different depths (the page,
// each TodoItem, each SubTodoItem...). Without Context we would pass `todos`
// and every action function down through each level as props ("prop
// drilling"), even through components that don't use them.
//
// How: <TodoProvider> puts a value into Context. Any descendant can read it
// with useContext(TodoContext) — wrapped for convenience in useTodos().
//
// The default is `null` so useTodos() can detect "used outside a provider"
// and throw a helpful error instead of silently returning undefined.
export const TodoContext = createContext<TodoContextValue | null>(null);

// =============================================================================
// 3. Provider
// =============================================================================
interface TodoProviderProps {
  children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
  // React concept: useReducer
  // Why: Todo state has many related operations (add, edit, delete, toggle,
  // plus the same for sub-todos, plus loading/error). useReducer keeps every
  // state transition in one predictable function instead of spreading logic
  // across many useState setters.
  //
  // How: components call an action function (e.g. addTodo), which calls
  // dispatch({ type, payload }). React then runs
  // todoReducer(currentState, action), stores the returned state, and
  // re-renders every component that consumes this context.
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);

  // Data flow: public/todos.json → fetch() → useTodoApi → dispatch(SET_TODOS)
  // → reducer → state.todos. The hook owns the useEffect that triggers this.
  const { reload } = useTodoApi(dispatch);

  // ---------------------------------------------------------------------------
  // Action creators
  // ---------------------------------------------------------------------------
  // These wrap dispatch so components call `addTodo('Buy milk')` rather than
  // building action objects. They are also where *impure* work happens
  // (generating IDs and timestamps) so the reducer can stay pure.
  //
  // IDs: crypto.randomUUID() gives each new item a stable, unique id. React
  // uses `key={todo.id}` to match list items between renders. Array indexes
  // are a bad key here because deleting/reordering items shifts indexes,
  // causing React to reuse the wrong component (and its internal state, e.g.
  // an open edit field) for the wrong todo.
  //
  // Note: these functions are recreated on every render of TodoProvider.
  // That only happens when `state` changes, at which point consumers
  // re-render anyway, so wrapping them in useCallback/useMemo would add
  // complexity without a measurable benefit here.
  const now = () => new Date().toISOString();

  const value: TodoContextValue = {
    todos: state.todos,
    loading: state.loading,
    error: state.error,
    reload,

    addTodo: (title) => {
      const timestamp = now();
      dispatch({
        type: 'ADD_TODO',
        payload: {
          id: crypto.randomUUID(),
          title,
          completed: false,
          subTodos: [],
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      });
    },
    updateTodo: (id, title) =>
      dispatch({ type: 'UPDATE_TODO', payload: { id, title, updatedAt: now() } }),
    deleteTodo: (id) => dispatch({ type: 'DELETE_TODO', payload: { id } }),
    toggleTodo: (id) => dispatch({ type: 'TOGGLE_TODO', payload: { id, updatedAt: now() } }),

    addSubTodo: (todoId, title) =>
      dispatch({
        type: 'ADD_SUB_TODO',
        payload: {
          todoId,
          subTodo: { id: crypto.randomUUID(), title, completed: false },
          updatedAt: now(),
        },
      }),
    updateSubTodo: (todoId, subTodoId, title) =>
      dispatch({ type: 'UPDATE_SUB_TODO', payload: { todoId, subTodoId, title, updatedAt: now() } }),
    deleteSubTodo: (todoId, subTodoId) =>
      dispatch({ type: 'DELETE_SUB_TODO', payload: { todoId, subTodoId, updatedAt: now() } }),
    toggleSubTodo: (todoId, subTodoId) =>
      dispatch({ type: 'TOGGLE_SUB_TODO', payload: { todoId, subTodoId, updatedAt: now() } }),
  };

  // React 19 lets you render <Context> directly as the provider
  // (older versions use <TodoContext.Provider value={...}>).
  return <TodoContext value={value}>{children}</TodoContext>;
}
