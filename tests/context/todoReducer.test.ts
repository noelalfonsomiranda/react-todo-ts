import { initialTodoState, todoReducer } from '../../src/context/TodoContext';
import type { TodoState } from '../../src/types/todo';
import { makeTodo, sampleTodos } from '../fixtures';

// Because the reducer is a pure function, we can test every state transition
// without rendering React at all: give it (state, action), check the result.

const NOW = '2026-10-09T10:00:00.000Z';

function stateWith(todos = sampleTodos): TodoState {
  return { todos, loading: false, error: null };
}

describe('todoReducer — loading lifecycle', () => {
  it('SET_TODOS stores todos and clears loading/error', () => {
    const next = todoReducer(initialTodoState, { type: 'SET_TODOS', payload: sampleTodos });
    expect(next).toEqual({ todos: sampleTodos, loading: false, error: null });
  });

  it('SET_ERROR stores the message and stops loading', () => {
    const next = todoReducer(initialTodoState, { type: 'SET_ERROR', payload: 'Boom' });
    expect(next.error).toBe('Boom');
    expect(next.loading).toBe(false);
  });

  it('SET_LOADING(true) clears a previous error (retry)', () => {
    const errored = { ...initialTodoState, loading: false, error: 'Boom' };
    const next = todoReducer(errored, { type: 'SET_LOADING', payload: true });
    expect(next).toMatchObject({ loading: true, error: null });
  });
});

describe('todoReducer — todos', () => {
  it('ADD_TODO prepends the new todo', () => {
    const newTodo = makeTodo({ id: 'new', title: 'New' });
    const next = todoReducer(stateWith(), { type: 'ADD_TODO', payload: newTodo });
    expect(next.todos[0]).toBe(newTodo);
    expect(next.todos).toHaveLength(4);
  });

  it('UPDATE_TODO changes only the targeted todo', () => {
    const state = stateWith();
    const next = todoReducer(state, {
      type: 'UPDATE_TODO',
      payload: { id: 'todo-3', title: 'Renamed', updatedAt: NOW },
    });
    expect(next.todos[2]).toMatchObject({ title: 'Renamed', updatedAt: NOW });
    // Untouched todos keep the SAME reference — proof we didn't copy needlessly.
    expect(next.todos[0]).toBe(state.todos[0]);
  });

  it('DELETE_TODO removes the todo', () => {
    const next = todoReducer(stateWith(), { type: 'DELETE_TODO', payload: { id: 'todo-2' } });
    expect(next.todos.map((t) => t.id)).toEqual(['todo-1', 'todo-3']);
  });

  it('TOGGLE_TODO flips completed', () => {
    const next = todoReducer(stateWith(), {
      type: 'TOGGLE_TODO',
      payload: { id: 'todo-1', updatedAt: NOW },
    });
    expect(next.todos[0]?.completed).toBe(true);
  });
});

describe('todoReducer — sub-todos', () => {
  it('ADD_SUB_TODO appends to the right todo', () => {
    const next = todoReducer(stateWith(), {
      type: 'ADD_SUB_TODO',
      payload: {
        todoId: 'todo-1',
        subTodo: { id: 'sub-new', title: 'Add tests', completed: false },
        updatedAt: NOW,
      },
    });
    expect(next.todos[0]?.subTodos.map((s) => s.id)).toEqual(['sub-1', 'sub-2', 'sub-new']);
    expect(next.todos[0]?.updatedAt).toBe(NOW);
  });

  it('UPDATE_SUB_TODO renames the sub-todo', () => {
    const next = todoReducer(stateWith(), {
      type: 'UPDATE_SUB_TODO',
      payload: { todoId: 'todo-1', subTodoId: 'sub-2', title: 'Create Context', updatedAt: NOW },
    });
    expect(next.todos[0]?.subTodos[1]?.title).toBe('Create Context');
  });

  it('DELETE_SUB_TODO removes the sub-todo', () => {
    const next = todoReducer(stateWith(), {
      type: 'DELETE_SUB_TODO',
      payload: { todoId: 'todo-1', subTodoId: 'sub-1', updatedAt: NOW },
    });
    expect(next.todos[0]?.subTodos.map((s) => s.id)).toEqual(['sub-2']);
  });

  it('TOGGLE_SUB_TODO flips completed', () => {
    const next = todoReducer(stateWith(), {
      type: 'TOGGLE_SUB_TODO',
      payload: { todoId: 'todo-1', subTodoId: 'sub-2', updatedAt: NOW },
    });
    expect(next.todos[0]?.subTodos[1]?.completed).toBe(true);
  });
});

describe('todoReducer — immutability', () => {
  // The key React rule: the reducer must never mutate its input.
  // Object.freeze makes any mutation attempt throw in strict mode,
  // so these tests fail loudly if someone writes `todo.completed = true`.
  it('never mutates the previous state', () => {
    const frozen = deepFreeze(stateWith(structuredClone(sampleTodos)));
    const next = todoReducer(frozen, {
      type: 'TOGGLE_SUB_TODO',
      payload: { todoId: 'todo-1', subTodoId: 'sub-1', updatedAt: NOW },
    });
    expect(next).not.toBe(frozen);
    expect(next.todos).not.toBe(frozen.todos);
    expect(frozen.todos[0]?.subTodos[0]?.completed).toBe(true); // original unchanged
  });
});

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
