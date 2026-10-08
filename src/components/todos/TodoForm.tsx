import { Form, Input, Modal } from 'antd';
import type { TodoFormValues } from '../../types/todo';
import { normalizeTitle, titleRules, TODO_TITLE_MAX_LENGTH } from '../../utils/validationUtils';

interface TodoFormProps {
  open: boolean;
  // Same component for create and edit: edit mode just passes an initial title.
  initialTitle?: string;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

// Responsibility: collect + validate a todo title inside a modal.
// It does NOT know about Context — it reports the result via `onSubmit`.
// That keeps it reusable (create & edit) and easy to test in isolation.
export function TodoForm({ open, initialTitle, onSubmit, onCancel }: TodoFormProps) {
  // Form instance lets the Modal's OK button trigger form submission.
  //
  // Controlled vs uncontrolled: Ant Design's Form keeps field values in its
  // own store (the form instance) rather than in our useState. The fields
  // are still "controlled" — by the Form, not by us — and we read the final
  // values in onFinish. This avoids writing onChange handlers for every field.
  const [form] = Form.useForm<TodoFormValues>();
  const isEdit = initialTitle !== undefined;

  // onFinish only runs if every validation rule passes.
  const handleFinish = (values: TodoFormValues) => {
    onSubmit(normalizeTitle(values.title));
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit todo' : 'Add todo'}
      okText={isEdit ? 'Save' : 'Add'}
      onOk={() => form.submit()}
      onCancel={onCancel}
      // Unmount the form when closed, so reopening starts from fresh
      // `initialValues` instead of whatever was typed last time.
      destroyOnHidden
    >
      <Form<TodoFormValues>
        form={form}
        layout="vertical"
        initialValues={{ title: initialTitle ?? '' }}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={titleRules('Title', TODO_TITLE_MAX_LENGTH)}
        >
          <Input
            placeholder="What needs to be done?"
            maxLength={TODO_TITLE_MAX_LENGTH}
            showCount
            autoFocus
            // Pressing Enter inside the input submits the form.
            onPressEnter={() => form.submit()}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
