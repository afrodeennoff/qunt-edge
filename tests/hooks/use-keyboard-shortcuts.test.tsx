/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../hooks/use-keyboard-shortcuts';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { pushMock, signOutMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  signOutMock: vi.fn(),
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Mock signOut
vi.mock('@/server/auth', () => ({
  signOut: signOutMock,
}));

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to dispatch event
  const triggerKey = (key: string, meta = false, ctrl = false, shift = false) => {
    const event = new KeyboardEvent('keydown', {
      key,
      code: `Key${key.toUpperCase()}`,
      keyCode: key.toUpperCase().charCodeAt(0),
      which: key.toUpperCase().charCodeAt(0),
      metaKey: meta,
      ctrlKey: ctrl,
      shiftKey: shift,
      bubbles: true,
      cancelable: true,
    } as any);
    document.dispatchEvent(event);
  };

  it('should initialize with dialog closed', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());
    expect(result.current.isDialogOpen).toBe(false);
  });

  it('should open dialog when Cmd+K is pressed', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    act(() => {
      triggerKey('k', true); // Cmd+K
    });

    expect(result.current.isDialogOpen).toBe(true);
  });

  it('should open dialog when Ctrl+K is pressed', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    act(() => {
        triggerKey('k', false, true); // Ctrl+K
    });

    expect(result.current.isDialogOpen).toBe(true);
  });
});
