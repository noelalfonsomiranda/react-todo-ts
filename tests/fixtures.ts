import type { Todo } from '../src/types/todo';

// Small factory so each test can build exactly the data it needs.
// `overrides` uses Partial<Todo>: every field optional, so tests only
// specify what matters to them.
export function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    title: 'Build Todo Application',
    completed: false,
    subTodos: [],
    createdAt: '2026-10-08T01:00:00.000Z',
    updatedAt: '2026-10-08T01:00:00.000Z',
    ...overrides,
  };
}

export const sampleTodos: Todo[] = [
  makeTodo({
    id: 'todo-1',
    title: 'Build Todo Application',
    subTodos: [
      { id: 'sub-1', title: 'Create React project', completed: true },
      { id: 'sub-2', title: 'Create Context API', completed: false },
    ],
  }),
  makeTodo({ id: 'todo-2', title: 'Review React Hooks', completed: true }),
  makeTodo({ id: 'todo-3', title: 'Write tests' }),
];
