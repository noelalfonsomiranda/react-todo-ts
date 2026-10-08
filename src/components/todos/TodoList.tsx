import { Flex } from 'antd';
import type { Todo } from '../../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
}

// Responsibility: render a list of todos. It receives the ALREADY filtered
// list as a prop, so it has no idea filtering/search exist — a "dumb"
// presentational component that is easy to reuse and test.
//
// Note: Ant Design 6.6 deprecated its <List> component, so we render with a
// plain .map(). Either way, the important part is `key={todo.id}`.
export function TodoList({ todos }: TodoListProps) {
  return (
    <Flex vertical gap="middle" role="list" aria-label="Todos">
      {todos.map((todo) => (
        <div role="listitem" key={todo.id}>
          <TodoItem todo={todo} />
        </div>
      ))}
    </Flex>
  );
}
