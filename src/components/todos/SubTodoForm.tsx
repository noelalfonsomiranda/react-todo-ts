import { Button, Form, Input, Space } from 'antd';
import type { SubTodoFormValues } from '../../types/todo';
import {
  normalizeTitle,
  SUB_TODO_TITLE_MAX_LENGTH,
  titleRules,
} from '../../utils/validationUtils';

interface SubTodoFormProps {
  initialTitle?: string;
  submitLabel?: string;
  onSubmit: (title: string) => void;
  onCancel?: () => void;
}

// Responsibility: inline form to create OR edit a sub-todo.
// - Create mode (no initialTitle): clears itself after a successful submit.
// - Edit mode (initialTitle given): parent hides it via onSubmit/onCancel.
export function SubTodoForm({
  initialTitle,
  submitLabel = 'Add',
  onSubmit,
  onCancel,
}: SubTodoFormProps) {
  const [form] = Form.useForm<SubTodoFormValues>();
  const isEdit = initialTitle !== undefined;

  const handleFinish = (values: SubTodoFormValues) => {
    onSubmit(normalizeTitle(values.title));
    if (!isEdit) form.resetFields();
  };

  return (
    <Form<SubTodoFormValues>
      form={form}
      initialValues={{ title: initialTitle ?? '' }}
      onFinish={handleFinish}
      style={{ width: '100%' }}
    >
      <Space.Compact style={{ width: '100%' }}>
        <Form.Item
          name="title"
          rules={titleRules('Sub-item', SUB_TODO_TITLE_MAX_LENGTH)}
          style={{ flex: 1, marginBottom: 0 }}
        >
          <Input
            placeholder="Add a sub-item..."
            aria-label={isEdit ? 'Edit sub-item title' : 'New sub-item title'}
            maxLength={SUB_TODO_TITLE_MAX_LENGTH}
            autoFocus={isEdit}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          {submitLabel}
        </Button>
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
      </Space.Compact>
    </Form>
  );
}
