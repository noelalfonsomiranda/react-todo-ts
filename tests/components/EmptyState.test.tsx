import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../src/components/common/EmptyState';

describe('EmptyState', () => {
  it('renders the default message', () => {
    render(<EmptyState />);
    expect(screen.getByText('No todos yet')).toBeInTheDocument();
  });

  it('renders a custom message', () => {
    render(<EmptyState description="Nothing matches" />);
    expect(screen.getByText('Nothing matches')).toBeInTheDocument();
  });
});
