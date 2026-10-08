// Adds DOM matchers like toBeInTheDocument(), toBeChecked(), toHaveValue().
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount rendered components after each test so tests don't leak into each other.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement window.matchMedia, but Ant Design uses it for
// responsive behaviour. Provide a minimal stub.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom also lacks ResizeObserver, which Ant Design popups (Popconfirm) use.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Plain assignment (not vi.stubGlobal) so unstubAllGlobals() in tests keeps it.
globalThis.ResizeObserver = ResizeObserverStub;
