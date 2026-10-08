import { Segmented } from 'antd';
import type { TodoFilter } from '../../types/todo';

interface TodoFiltersProps {
  value: TodoFilter;
  onChange: (filter: TodoFilter) => void;
}

const FILTER_OPTIONS: { label: string; value: TodoFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

// Responsibility: let the user pick All / Active / Completed.
// It is a *controlled component*: the parent owns the value and passes it
// down; this component just reports changes via onChange.
export function TodoFilters({ value, onChange }: TodoFiltersProps) {
  // Segmented<TodoFilter> is a generic component: TypeScript knows onChange
  // receives a TodoFilter, not just a string.
  return <Segmented<TodoFilter> options={FILTER_OPTIONS} value={value} onChange={onChange} />;
}
