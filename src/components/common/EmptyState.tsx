import { Empty } from 'antd';

interface EmptyStateProps {
  description?: string;
}

// Reusable "nothing to show" placeholder. The caller supplies the message,
// so the same component covers "no todos yet" and "no search results".
export function EmptyState({ description = 'No todos yet' }: EmptyStateProps) {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />;
}
