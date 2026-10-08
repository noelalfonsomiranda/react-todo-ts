import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface TodoSearchProps {
  value: string;
  onChange: (value: string) => void;
}

// Responsibility: the search text box. Controlled input: the parent's state
// is the source of truth; every keystroke calls onChange, and React
// re-renders the input with the new value.
//
// The parent debounces this value before filtering (see TodoPage), so the
// input itself stays instant and responsive.
export function TodoSearch({ value, onChange }: TodoSearchProps) {
  return (
    <Input
      allowClear
      prefix={<SearchOutlined />}
      placeholder="Search todos..."
      aria-label="Search todos"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ maxWidth: 320 }}
    />
  );
}
