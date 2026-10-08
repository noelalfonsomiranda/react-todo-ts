import { Alert, Button } from 'antd';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

// Shown when the fetch fails (state.error !== null).
// Reusable: it knows nothing about todos — it just shows a message and a
// retry button, so the parent decides what "retry" means.
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      type="error"
      showIcon
      title="Could not load todos"
      description={message}
      action={
        <Button size="small" danger onClick={onRetry}>
          Retry
        </Button>
      }
    />
  );
}
