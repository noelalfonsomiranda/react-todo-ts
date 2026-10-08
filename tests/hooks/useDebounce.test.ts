import { act, renderHook } from '@testing-library/react';
import { useDebounce } from '../../src/hooks/useDebounce';

// renderHook lets us test a hook without building a component around it.
// Fake timers let us control setTimeout instead of really waiting.
describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('only updates after the value stops changing for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'r' },
    });
    expect(result.current).toBe('r');

    rerender({ value: 're' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'rea' }); // new keystroke cancels the pending timeout
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('r'); // still the old value

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('rea'); // 300ms after the LAST change
  });
});
