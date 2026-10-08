import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '../../src/components/todos/TodoForm';
import { TODO_TITLE_MAX_LENGTH } from '../../src/utils/validationUtils';

// TodoForm is tested in isolation: no Context needed, because it only
// reports results through the onSubmit prop.
describe('TodoForm', () => {
  it('shows a validation error and does not submit when the title is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm open onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a whitespace-only title', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm open onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Title'), '    ');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a trimmed title', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm open onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Title'), '  Learn useReducer  ');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Learn useReducer'));
  });

  it('pre-fills the title in edit mode', () => {
    render(<TodoForm open initialTitle="Existing" onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText('Title')).toHaveValue('Existing');
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('limits the title length', () => {
    render(<TodoForm open onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText('Title')).toHaveAttribute('maxlength', String(TODO_TITLE_MAX_LENGTH));
  });
});
