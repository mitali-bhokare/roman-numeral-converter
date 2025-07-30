import { act, renderHook, waitFor } from '@testing-library/react';
import { useSystemColorScheme } from './useSystemColorScheme';
import { vi, describe, beforeEach, it, expect, type Mock, } from 'vitest';

describe('useSystemColorScheme', () => {

    let addEventListenerMock: Mock;
    let removeEventListenerMock: Mock;
    const listeners: Record<string, () => void> = {};

    beforeEach(() => {
        addEventListenerMock = vi.fn((event, cb) => {
            listeners[event] = cb;
        });

        removeEventListenerMock = vi.fn((event) => {
            delete listeners[event];
        });

        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            addEventListener: addEventListenerMock,
            removeEventListener: removeEventListenerMock,
        }));
    });

    it('returns "dark" when system is in dark mode', () => {
        const { result } = renderHook(() => useSystemColorScheme());
        expect(result.current).toBe('dark');
    });

    it('returns "light" when system is in light mode', () => {
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            addEventListener: addEventListenerMock,
            removeEventListener: removeEventListenerMock,
        }));

        const { result } = renderHook(() => useSystemColorScheme());
        expect(result.current).toBe('light');
    });

    it('updates when the system theme changes', async () => {
        let changeHandler: EventListener;
        const addEventListenerMock = vi.fn((event, handler) => {
            if (event === 'change') {
                changeHandler = handler;
            }
        });
        const removeEventListenerMock = vi.fn();

        let mediaQuery: any;

        window.matchMedia = vi.fn().mockImplementation((query: string) => {
            mediaQuery = {
                matches: true, // start in dark mode
                media: query,
                onchange: null,
                addEventListener: addEventListenerMock,
                removeEventListener: removeEventListenerMock,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn(),
            };
            return mediaQuery;
        });

        const { result } = renderHook(() => useSystemColorScheme());

        // Flip to light mode and simulate the change
        act(() => {
            mediaQuery.matches = false;
            changeHandler?.(new Event('change'));
        });

        await waitFor(() => {
            expect(result.current).toBe('light');
        });
    });


    it('removes event listener on unmount', () => {
        const { unmount } = renderHook(() => useSystemColorScheme());
        unmount();

        expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });
});
