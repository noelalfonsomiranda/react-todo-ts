import { TodoProvider } from './context/TodoContext';
import { TodoPage } from './pages/TodoPage';

// The provider must wrap every component that calls useTodos().
// Placing it at the top of the tree makes Todo state available app-wide.
export default function App() {
  return (
    <TodoProvider>
      <TodoPage />
    </TodoProvider>
  );
}
