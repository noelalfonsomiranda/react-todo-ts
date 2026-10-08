import { useState } from 'react';
import { Button, Card, Checkbox, Collapse, Flex, Popconfirm, Progress, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { Todo } from '../../types/todo';
import { useTodos } from '../../hooks/useTodos';
import {
  formatDate,
  getCompletedSubTodoCount,
  getTodoProgress,
  getTotalSubTodoCount,
} from '../../utils/todoUtils';
import { TodoForm } from './TodoForm';
import { SubTodoList } from './SubTodoList';

interface TodoItemProps {
  todo: Todo;
}

// Responsibility: display ONE todo — title, status, dates, progress — and
// host its edit modal and sub-item list.
export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, updateTodo, deleteTodo } = useTodos();

  // Local UI state: whether THIS todo's edit modal is open.
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Derived values: computed from props on every render rather than stored
  // in state. Storing them would duplicate data that could drift out of sync.
  // They are cheap, so no useMemo needed.
  const completedCount = getCompletedSubTodoCount(todo);
  const totalCount = getTotalSubTodoCount(todo);
  const progress = getTodoProgress(todo);

  return (
    <Card size="small">
      <Flex justify="space-between" align="flex-start" gap="middle">
        <Flex vertical gap={4} style={{ minWidth: 0 }}>
          <Checkbox checked={todo.completed} onChange={() => toggleTodo(todo.id)}>
            <Typography.Text strong delete={todo.completed} style={{ fontSize: 16 }}>
              {todo.title}
            </Typography.Text>
          </Checkbox>
          <Flex wrap gap={4}>
            <Tag color={todo.completed ? 'green' : 'blue'}>
              {todo.completed ? 'Completed' : 'Active'}
            </Tag>
            <Tag>Created {formatDate(todo.createdAt)}</Tag>
            {totalCount > 0 && (
              <Tag>
                {completedCount} / {totalCount} completed
              </Tag>
            )}
          </Flex>
        </Flex>

        <Flex gap={4}>
          <Button
            icon={<EditOutlined />}
            aria-label={`Edit ${todo.title}`}
            onClick={() => setIsEditOpen(true)}
          />
          <Popconfirm
            title="Delete this todo?"
            description="Its sub-items will be deleted too."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteTodo(todo.id)}
          >
            <Button danger icon={<DeleteOutlined />} aria-label={`Delete ${todo.title}`} />
          </Popconfirm>
        </Flex>
      </Flex>

      {totalCount > 0 && <Progress percent={progress} size="small" style={{ marginTop: 8 }} />}

      <Collapse
        ghost
        size="small"
        items={[
          {
            key: 'subtodos',
            label: `Sub-items (${totalCount})`,
            children: <SubTodoList todo={todo} />,
          },
        ]}
      />

      {/* Reuses the same TodoForm as "Add", in edit mode via initialTitle. */}
      <TodoForm
        open={isEditOpen}
        initialTitle={todo.title}
        onCancel={() => setIsEditOpen(false)}
        onSubmit={(title) => {
          updateTodo(todo.id, title);
          setIsEditOpen(false);
        }}
      />
    </Card>
  );
}
