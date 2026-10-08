import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// StrictMode (development only) double-invokes renders, reducers and
// effects to surface impure code and missing effect cleanups.
// That's why useTodoApi's effect has an `ignore` flag in its cleanup.
//
// The `!` is a TypeScript non-null assertion: getElementById returns
// `HTMLElement | null`, and we know #root exists in index.html.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
