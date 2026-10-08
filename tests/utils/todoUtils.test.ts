import {
  filterTodos,
  getCompletedSubTodoCount,
  getTodoProgress,
  getTotalSubTodoCount,
  searchTodos,
} from '../../src/utils/todoUtils';
import { makeTodo, sampleTodos } from '../fixtures';

// Pure functions → plain input/output tests, no rendering required.

describe('filterTodos', () => {
  it('returns every todo for "all"', () => {
    expect(filterTodos(sampleTodos, 'all')).toHaveLength(3);
  });

  it('returns only incomplete todos for "active"', () => {
    const result = filterTodos(sampleTodos, 'active');
    expect(result.map((t) => t.id)).toEqual(['todo-1', 'todo-3']);
  });

  it('returns only completed todos for "completed"', () => {
    const result = filterTodos(sampleTodos, 'completed');
    expect(result.map((t) => t.id)).toEqual(['todo-2']);
  });

  it('combines the status filter with the search term', () => {
    const result = filterTodos(sampleTodos, 'active', 'build');
    expect(result.map((t) => t.id)).toEqual(['todo-1']);
  });

  it('does not mutate the input array', () => {
    const copy = [...sampleTodos];
    filterTodos(sampleTodos, 'completed', 'review');
    expect(sampleTodos).toEqual(copy);
  });
});

describe('searchTodos', () => {
  it('matches titles case-insensitively', () => {
    expect(searchTodos(sampleTodos, 'REACT').map((t) => t.id)).toEqual(['todo-2']);
  });

  it('ignores surrounding whitespace and returns all for an empty term', () => {
    expect(searchTodos(sampleTodos, '   ')).toBe(sampleTodos);
    expect(searchTodos(sampleTodos, '  tests ').map((t) => t.id)).toEqual(['todo-3']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchTodos(sampleTodos, 'zzz')).toEqual([]);
  });
});

describe('progress helpers', () => {
  const todo = makeTodo({
    subTodos: [
      { id: 'a', title: 'A', completed: true },
      { id: 'b', title: 'B', completed: true },
      { id: 'c', title: 'C', completed: true },
      { id: 'd', title: 'D', completed: false },
    ],
  });

  it('counts completed and total sub-todos', () => {
    expect(getCompletedSubTodoCount(todo)).toBe(3);
    expect(getTotalSubTodoCount(todo)).toBe(4);
  });

  it('calculates a rounded percentage', () => {
    expect(getTodoProgress(todo)).toBe(75);
  });

  it('returns 0 for a todo with no sub-todos (no divide-by-zero)', () => {
    expect(getTodoProgress(makeTodo())).toBe(0);
  });
});
