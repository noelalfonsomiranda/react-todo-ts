import { Flex, Typography } from 'antd';
import type { Todo } from '../../types/todo';
import { useTodos } from '../../hooks/useTodos';
import { SubTodoItem } from './SubTodoItem';
import { SubTodoForm } from './SubTodoForm';

interface SubTodoListProps {
  todo: Todo;
}

// Responsibility: render a todo's sub-items plus the "add sub-item" form.
export function SubTodoList({ todo }: SubTodoListProps) {
  const { addSubTodo } = useTodos();

  return (
    <Flex vertical gap="small">
      {todo.subTodos.length === 0 && (
        <Typography.Text type="secondary">No sub-items yet.</Typography.Text>
      )}

      {/* key={sub.id}: a stable identity so React can match each row between
          renders. Using the array index would break when an item is deleted
          (every later row's key shifts, and React reuses the wrong row —
          e.g. an open edit form would jump to a different sub-item). */}
      {todo.subTodos.map((sub) => (
        <SubTodoItem key={sub.id} todoId={todo.id} subTodo={sub} />
      ))}

      <SubTodoForm onSubmit={(title) => addSubTodo(todo.id, title)} />
    </Flex>
  );
}
