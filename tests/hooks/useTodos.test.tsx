import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useTodos } from '../../src/hooks/useTodos';
import { TodoProvider } from '../../src/context/TodoContext';
import { sampleTodos } from '../fixtures';

// Integration test: Provider + useTodoApi + reducer + useTodos together.
// We replace the global fetch with a mock so no real network is involved.

function mockFetch(response: Partial<Response>) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

const wrapper = ({ children }: { children: ReactNode }) => <TodoProvider>{children}</TodoProvider>;

afterEach(() => vi.unstubAllGlobals());

describe('useTodos', () => {
  it('throws a helpful error outside <TodoProvider>', () => {
    // Silence React's error log for this intentional throw.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTodos())).toThrow(/TodoProvider/);
  });

  it('loads todos from /todos.json on mount', async () => {
    mockFetch({ ok: true, json: () => Promise.resolve(sampleTodos) });
    const { result } = renderHook(() => useTodos(), { wrapper });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toHaveLength(3);
    expect(fetch).toHaveBeenCalledWith('/todos.json');
  });

  it('exposes an error when the response is not ok, and recovers on reload', async () => {
    mockFetch({ ok: false, status: 404 });
    const { result } = renderHook(() => useTodos(), { wrapper });
    await waitFor(() => expect(result.current.error).toMatch(/404/));

    mockFetch({ ok: true, json: () => Promise.resolve(sampleTodos) });
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.todos).toHaveLength(3));
    expect(result.current.error).toBeNull();
  });

  it('action functions update state (addTodo, addSubTodo)', async () => {
    mockFetch({ ok: true, json: () => Promise.resolve([]) });
    const { result } = renderHook(() => useTodos(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.addTodo('Learn hooks'));
    const created = result.current.todos[0]!;
    expect(created.title).toBe('Learn hooks');
    expect(created.id).toBeTruthy();

    act(() => result.current.addSubTodo(created.id, 'useMemo'));
    expect(result.current.todos[0]?.subTodos[0]?.title).toBe('useMemo');
  });
});
