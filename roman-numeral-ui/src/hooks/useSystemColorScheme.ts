import { useEffect, useState } from 'react';

/**
 * Custom React hook that returns the user's current system color scheme ("light" or "dark").
 * It listens for changes to the system preference and updates automatically.
 *
 * @returns 'light' | 'dark' based on system theme preference
 */
export function useSystemColorScheme(): 'light' | 'dark' {
  /**
   * Returns the current system preference using the `matchMedia` API.
   */
  const getCurrentScheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    // Default to light mode for unsupported browsers
    return 'light';
  };

  // Initial value for color scheme state
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(getCurrentScheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setColorScheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return colorScheme;
}
