import { useMemo, useState } from 'react';
import { Button, Card, Flex, Layout, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { TodoFilter } from '../types/todo';
import { useTodos } from '../hooks/useTodos';
import { useDebounce } from '../hooks/useDebounce';
import { filterTodos } from '../utils/todoUtils';
import { TodoForm } from '../components/todos/TodoForm';
import { TodoFilters } from '../components/todos/TodoFilters';
import { TodoSearch } from '../components/todos/TodoSearch';
import { TodoList } from '../components/todos/TodoList';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';

// Responsibility: coordinate the page. It owns the page-level UI state
// (filter, search, "add" modal), derives the visible list, and decides
// which state to render: loading → error → empty → list.
export function TodoPage() {
  // Shared data + actions from Context (via our custom hook).
  const { todos, loading, error, reload, addTodo } = useTodos();

  // React concept: useState for LOCAL UI state
  // Why not in Context? The filter, search box and modal visibility only
  // matter to this page. Keeping them local means:
  //   - typing in search doesn't re-render every Context consumer
  //   - the global store holds only real app data (todos), not UI details
  // Rule of thumb: keep state as close as possible to where it is used;
  // lift it up (or into Context) only when other components need it.
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // The input updates `searchTerm` on every keystroke (instant feedback);
  // filtering uses the debounced value, which only updates 300ms after the
  // user stops typing.
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // React concept: useMemo
  // What: caches the result of filterTodos(...) between renders.
  // Why: filteredTodos is *derived data* — fully computable from todos,
  //   filter and the search term — so we compute it rather than store it in
  //   state (storing it would mean keeping two copies in sync).
  // When it recalculates: only when a value in the dependency array changes
  //   (compared with Object.is). Re-renders for other reasons — e.g. opening
  //   the Add modal, or each keystroke before the debounce fires — reuse
  //   the cached array.
  // Important: useMemo is a performance optimisation, not a correctness
  //   tool. The app works identically without it. Don't wrap every value:
  //   for cheap calculations the memo bookkeeping can cost more than it
  //   saves. Filtering a list that may grow is a reasonable candidate.
  const filteredTodos = useMemo(() => {
    return filterTodos(todos, filter, debouncedSearchTerm);
  }, [todos, filter, debouncedSearchTerm]);

  // Choose what to render based on the loading lifecycle.
  // Initial → Loading → fetch ├─ success → todos (or empty)
  //                           └─ error   → ErrorState (Retry → Loading)
  function renderContent() {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (todos.length === 0) return <EmptyState description="No todos yet — add one!" />;
    if (filteredTodos.length === 0) return <EmptyState description="No todos match your filters" />;
    return <TodoList todos={filteredTodos} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
        <Typography.Title level={3} style={{ color: '#fff', margin: 0 }}>
          React Todo Refresher
        </Typography.Title>
      </Layout.Header>

      <Layout.Content style={{ padding: 24, maxWidth: 860, width: '100%', margin: '0 auto' }}>
        <Card>
          <Flex vertical gap="middle">
            <Flex justify="space-between" align="center" wrap gap="middle">
              <TodoSearch value={searchTerm} onChange={setSearchTerm} />
              <Flex gap="middle" wrap>
                <TodoFilters value={filter} onChange={setFilter} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddOpen(true)}>
                  Add todo
                </Button>
              </Flex>
            </Flex>

            {renderContent()}
          </Flex>
        </Card>
      </Layout.Content>

      <TodoForm
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        onSubmit={(title) => {
          addTodo(title);
          setIsAddOpen(false);
        }}
      />
    </Layout>
  );
}
