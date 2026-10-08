import { useState } from 'react';
import { Button, Checkbox, Flex, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { SubTodo } from '../../types/todo';
import { useTodos } from '../../hooks/useTodos';
import { SubTodoForm } from './SubTodoForm';

interface SubTodoItemProps {
  todoId: string;
  subTodo: SubTodo;
}

// Responsibility: display ONE sub-todo with toggle / edit / delete.
export function SubTodoItem({ todoId, subTodo }: SubTodoItemProps) {
  // Actions come straight from Context via useTodos() — no prop drilling
  // through TodoItem → SubTodoList → SubTodoItem.
  const { toggleSubTodo, updateSubTodo, deleteSubTodo } = useTodos();

  // React concept: local UI state with useState
  // "Is this row in edit mode?" matters only to this row. Putting it in
  // global Context would make every consumer re-render when one row toggles
  // edit mode, and it isn't real app data — it's UI state.
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <SubTodoForm
        initialTitle={subTodo.title}
        submitLabel="Save"
        onSubmit={(title) => {
          updateSubTodo(todoId, subTodo.id, title);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Flex align="center" justify="space-between" gap="small">
      <Checkbox
        checked={subTodo.completed}
        onChange={() => toggleSubTodo(todoId, subTodo.id)}
      >
        <Typography.Text delete={subTodo.completed} type={subTodo.completed ? 'secondary' : undefined}>
          {subTodo.title}
        </Typography.Text>
      </Checkbox>
      <span>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          aria-label={`Edit sub-item ${subTodo.title}`}
          onClick={() => setIsEditing(true)}
        />
        <Popconfirm
          title="Delete this sub-item?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteSubTodo(todoId, subTodo.id)}
        >
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Delete sub-item ${subTodo.title}`}
          />
        </Popconfirm>
      </span>
    </Flex>
  );
}
