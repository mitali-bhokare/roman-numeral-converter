import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for useSystemColorScheme
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    return {
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
  }
});
