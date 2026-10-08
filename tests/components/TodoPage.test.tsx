import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoProvider } from '../../src/context/TodoContext';
import { TodoPage } from '../../src/pages/TodoPage';
import type { Todo } from '../../src/types/todo';
import { sampleTodos } from '../fixtures';

// Integration tests: render the real page inside the real provider, with
// only `fetch` mocked. We interact the way a user would (click, type) and
// assert on what the user would see — React Testing Library's philosophy.

function renderPage(todos: Todo[] = sampleTodos) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(todos) }),
  );
  return render(
    <TodoProvider>
      <TodoPage />
    </TodoProvider>,
  );
}

// Each todo is rendered as a listitem; find the one containing `title`.
function getTodoItem(title: string) {
  return screen.getAllByRole('listitem').find((el) => within(el).queryByText(title))!;
}

afterEach(() => vi.unstubAllGlobals());

describe('TodoPage', () => {
  it('shows a loader, then renders the fetched todos', async () => {
    renderPage();
    expect(screen.getByText('Loading todos...')).toBeInTheDocument();

    expect(await screen.findByText('Build Todo Application')).toBeInTheDocument();
    expect(screen.getByText('Review React Hooks')).toBeInTheDocument();
    expect(screen.getByText('1 / 2 completed')).toBeInTheDocument();
  });

  it('shows the empty state when there are no todos', async () => {
    renderPage([]);
    expect(await screen.findByText('No todos yet — add one!')).toBeInTheDocument();
  });

  it('shows an error with a Retry button when loading fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    render(
      <TodoProvider>
        <TodoPage />
      </TodoProvider>,
    );
    expect(await screen.findByText('Could not load todos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('adds a new todo through the modal form', async () => {
    const user = userEvent.setup();
    renderPage([]);
    await screen.findByText('No todos yet — add one!');

    await user.click(screen.getByRole('button', { name: /add todo/i }));
    await user.type(screen.getByLabelText('Title'), 'Practice interviews');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Practice interviews')).toBeInTheDocument();
  });

  it('toggles a todo as completed', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Write tests');

    const checkbox = within(getTodoItem('Write tests')).getAllByRole('checkbox')[0]!;
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('deletes a todo after confirming', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Write tests');

    await user.click(screen.getByRole('button', { name: 'Delete Write tests' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByText('Write tests')).not.toBeInTheDocument());
  });

  it('filters by status', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Write tests');

    // Scope to the filter control: "Completed" also appears in status tags.
    await user.click(within(screen.getByRole('radiogroup')).getByText('Completed'));

    expect(screen.getByText('Review React Hooks')).toBeInTheDocument();
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
  });

  it('searches by title (debounced)', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Write tests');

    await user.type(screen.getByLabelText('Search todos'), 'hooks');

    // waitFor retries until the 300ms debounce has fired and the list updates.
    await waitFor(() => expect(screen.queryByText('Write tests')).not.toBeInTheDocument());
    expect(screen.getByText('Review React Hooks')).toBeInTheDocument();
  });

  it('adds and toggles a sub-item', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Write tests');
    const item = getTodoItem('Write tests');

    // Sub-items live inside a Collapse panel — expand it first.
    await user.click(within(item).getByText('Sub-items (0)'));
    await user.type(within(item).getByLabelText('New sub-item title'), 'Reducer tests');
    await user.click(within(item).getByRole('button', { name: 'Add' }));

    const subCheckbox = await within(item).findByRole('checkbox', { name: 'Reducer tests' });
    await user.click(subCheckbox);
    expect(subCheckbox).toBeChecked();
    expect(within(item).getByText('1 / 1 completed')).toBeInTheDocument();
  });
});
