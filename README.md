# React Todo Refresher

A small React + TypeScript Todo app for brushing up on modern React before a frontend interview. The code is written to be **read**: important lines have short comments explaining *what*, *why* and *how*.

Frontend only. No backend, no persistence: state lives in React memory, so **refreshing the page resets everything to `public/todos.json`**.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest in watch mode
npm run test:run   # run tests once
npm run build      # typecheck + production build
```

**Stack:** React 19 · TypeScript (strict) · Vite · Ant Design 6 · Vitest · React Testing Library

---

## Data flow

```text
public/todos.json
       ↓
     fetch()            src/api/todoApi.ts        GET /todos.json, check response.ok, parse JSON
       ↓
  useTodoApi()          src/hooks/useTodoApi.ts   useEffect on mount → dispatch SET_LOADING / SET_TODOS / SET_ERROR
       ↓
  TodoContext           src/context/TodoContext.tsx
       ↓
   useReducer()         todoReducer: (state, action) => nextState
       ↓
   Todo State           { todos, loading, error }
       ↓
    useTodos()          src/hooks/useTodos.ts     useContext + "inside a provider?" guard
       ↓
React Components        TodoPage → TodoList → TodoItem → SubTodoList → SubTodoItem
```

**User actions flow the other way:**

```text
click checkbox → toggleTodo(id) → dispatch({ type: 'TOGGLE_TODO', payload }) →
todoReducer returns NEW state → Context value changes → consumers re-render
```

**Loading lifecycle:**

```text
Initial (loading: true)
  ↓
Effect runs → fetch
  ├── Success → SET_TODOS → list (or EmptyState if [])
  └── Error   → SET_ERROR → ErrorState → Retry → reload() → effect runs again
```

---

## Learning map

| Concept | File | Purpose |
| --- | --- | --- |
| `useState` | `TodoPage`, `TodoItem`, `SubTodoItem` | Local UI state: filter, search text, modal open, edit mode |
| `useEffect` | `useTodoApi`, `useDebounce` | Initial data load (with cleanup) and debounce timer |
| `useReducer` | `context/TodoContext.tsx` | All Todo state transitions in one pure function |
| `useContext` | `hooks/useTodos.ts` | Read shared state without prop drilling |
| `useMemo` | `pages/TodoPage.tsx` | Memoized filtered + searched todo list |
| Custom hook | `useTodos` | Public API for Todo state and actions |
| Custom hook | `useTodoApi` | Fetch lifecycle (loading / success / error / retry) |
| Custom hook | `useDebounce` | Debounced search value |
| `fetch` | `api/todoApi.ts` | Load the initial JSON |
| Immutable updates | `todoReducer` | Spread, `map`, `filter`, nested updates |
| Discriminated union | `types/todo.ts` → `TodoAction` | Type-safe actions and reducer narrowing |
| Exhaustiveness check | `todoReducer` `default` case | Compiler error if an action is not handled |
| Generics | `useDebounce<T>`, `Form<TodoFormValues>` | Reusable, type-preserving code |
| Pure functions | `utils/todoUtils.ts` | Filtering, search and progress, easy to unit test |
| Form validation | `TodoForm`, `SubTodoForm`, `validationUtils.ts` | Required, whitespace-only, max length, trim |
| Keys | `TodoList`, `SubTodoList` | Stable `id` keys, never array indexes |
| Ant Design | `components/` | UI |
| Testing | `tests/` | Reducer, utils, hooks, components |

### Project structure

```text
src/
├── api/todoApi.ts            fetch() wrapper (the only network call)
├── components/
│   ├── common/               EmptyState, ErrorState, LoadingState (reusable, no Todo knowledge)
│   └── todos/                TodoList, TodoItem, TodoForm, TodoFilters, TodoSearch,
│                             SubTodoList, SubTodoItem, SubTodoForm
├── context/TodoContext.tsx   reducer + Context + Provider + action creators
├── hooks/                    useTodos, useTodoApi, useDebounce
├── pages/TodoPage.tsx        page coordinator: filter/search state, useMemo, render states
├── types/todo.ts             all domain, state, action, context and form types
├── utils/                    pure helpers + validation rules
└── App.tsx, main.tsx, index.css
public/todos.json             initial data (never modified)
tests/                        components/ hooks/ context/ utils/
```

### Design notes

- **Where `useMemo` lives.** Filter and search are *local* UI state owned by `TodoPage`, so the memoized `filteredTodos` lives there too. `useTodos()` stays a thin Context accessor that every component can call cheaply.
- **The reducer stays pure.** IDs (`crypto.randomUUID()`) and timestamps (`new Date()`) are created in the action creators and passed in through the payload, never inside the reducer.
- **No `useCallback`.** Action functions are recreated only when `TodoProvider` re-renders, which happens only when state changes, and consumers re-render then anyway. No child is wrapped in `React.memo`, so stable function references would buy nothing.
- **Ant Design `List`.** antd 6.6 deprecated `<List>` (it will be removed in v7), so lists are plain `.map()` calls inside `Flex`.

---

## Interview questions (answered for this project)

**1. What is Context API?**
A way to pass a value to every component in a subtree without threading props through each level. You create it with `createContext`, provide it with `<TodoContext value={...}>`, and read it with `useContext`.

**2. Why use Context in this app?**
`todos` and the actions are needed by `TodoPage`, every `TodoItem` and every `SubTodoItem`. The update frequency is low and there is one feature, so Context + `useReducer` is enough. A state library would be overkill here.

**3. What is prop drilling?**
Passing props through components that don't use them, only so a deeper child can. Without Context, `toggleSubTodo` would travel `TodoPage → TodoList → TodoItem → SubTodoList → SubTodoItem`.

**4. Why `useReducer` instead of several `useState` calls?**
There are 11 related transitions (loading, error, CRUD for todos and sub-todos). A reducer puts them in one predictable, testable function. Components describe *what happened* (`dispatch(action)`); the reducer decides *how state changes*.

**5. How does `dispatch()` work?**
`dispatch(action)` asks React to run `todoReducer(currentState, action)`. React stores the returned state and re-renders components that use it. `dispatch` itself keeps the same identity across renders.

**6. Why must reducers be pure?**
React may call them more than once (StrictMode does this deliberately). Pure reducers give the same output for the same input, so this is safe, and they are trivial to unit test (`tests/context/todoReducer.test.ts`).

**7. Why not mutate state?**
React detects changes by reference (`Object.is`). `todo.subTodos.push(x)` keeps the same reference, so React may skip the re-render and the UI goes stale. It also breaks memoization and makes bugs hard to trace. We create new objects along the changed path (`state → todos → todo → subTodos → subTodo`) and reuse everything else.

**8. What is `useEffect`?**
A hook for side effects: work outside React's pure render, such as fetching, timers and subscriptions. It runs after the render is committed. It can return a cleanup function.

**9. What does the dependency array do?**
It controls when the effect re-runs. No array: after every render. `[]`: once on mount. `[a, b]`: on mount and whenever `a` or `b` changes. `useTodoApi` uses `[dispatch, requestId]`. `dispatch` never changes, so the effect runs on mount and again when Retry bumps `requestId`.

**10. What causes a re-render?**
A component's own state changing (`useState` / `useReducer`), its parent re-rendering, or a Context it consumes changing value.

**11. What is a custom hook?**
A function starting with `use` that calls other hooks to reuse stateful logic. `useTodos` hides Context and guards against a missing provider. `useTodoApi` owns the fetch lifecycle. `useDebounce` owns a timer.

**12. Why separate API logic from components?**
Components stay focused on UI. Data access is replaceable (swap JSON for REST in `todoApi.ts`) and mockable in tests (`vi.stubGlobal('fetch', ...)`).

**13. What is `useMemo`?**
It caches a computed value between renders and recomputes only when a dependency changes.

**14. Why use it here?**
`filteredTodos` is derived from `todos`, `filter` and the debounced search. Other re-renders, such as opening a modal or typing before the debounce fires, reuse the cached array instead of filtering again.

**15. When should you avoid `useMemo`?**
For cheap calculations, where it adds code and memory with no measurable gain. Also never rely on it for correctness, because React may discard the cache. Measure first. `TodoItem` computes its progress without `useMemo` on purpose.

**16. `useMemo` vs `useCallback`?**
`useMemo(() => value, deps)` caches a **value**. `useCallback(fn, deps)` caches a **function** and is equivalent to `useMemo(() => fn, deps)`. `useCallback` helps when a function is passed to a `React.memo` child or used as an effect dependency. Neither case applies in this app, so it isn't used.

**17. Why are array indexes bad keys?**
Keys tell React which item is which between renders. If you delete the first todo, every index shifts. React then reuses components and their local state (for example `SubTodoItem`'s `isEditing`) for the wrong item. Stable IDs (`crypto.randomUUID()`) avoid this.

**18. How would you persist this in a real app?**
Add a backend API (REST/GraphQL) with POST/PATCH/DELETE. Use a server-state library such as React Query / TanStack Query for caching, refetching and optimistic updates. Validate responses at runtime (for example with zod). `localStorage` is fine only for offline or draft use.

**19. How would you handle a large list?**
Paginate or use infinite scroll from the server. Do server-side filtering and search, which the debounce already prepares for. Virtualize rendering (for example `react-window` or antd `Listy`). Wrap `TodoItem` in `React.memo`, which works well because the reducer preserves references for unchanged todos. At that point `useCallback` becomes relevant.

**20. How would you scale the architecture?**
Organize by feature folders (`features/todos/...`). Split Context into state and dispatch contexts, or move to Zustand/Redux Toolkit, to reduce re-renders. Keep server state in React Query and client UI state local. Add routing, an error boundary, an API client layer with auth, and E2E tests (Playwright).

---

## Testing

| File | What it checks |
| --- | --- |
| `tests/utils/todoUtils.test.ts` | Filtering, search, progress maths, no mutation |
| `tests/context/todoReducer.test.ts` | Every action, plus a deep-freeze immutability test |
| `tests/hooks/useDebounce.test.ts` | Fake timers: only the last value is applied |
| `tests/hooks/useTodos.test.tsx` | Provider + fetch mock: load, error, retry, actions |
| `tests/components/TodoForm.test.tsx` | Required / whitespace / trim / edit mode / max length |
| `tests/components/TodoPage.test.tsx` | Loading, empty, error, add, toggle, delete, filter, search, sub-items |
| `tests/components/EmptyState.test.tsx` | Empty state messages |
