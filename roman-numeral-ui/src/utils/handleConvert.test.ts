import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleConvert } from './handleConvert';

describe('handleConvert', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns error for non-numeric input', async () => {
    const result = await handleConvert('abc');
    expect(result.error).toBe('Please enter a number between 1 and 3999.');
  });

  it('returns error for number < 1', async () => {
    const result = await handleConvert('0');
    expect(result.error).toBe('Please enter a number between 1 and 3999.');
  });

  it('returns error for number > 3999', async () => {
    const result = await handleConvert('4000');
    expect(result.error).toBe('Please enter a number between 1 and 3999.');
  });

  it('returns roman numeral on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output: 'X' })
    }));

    const result = await handleConvert('10');
    expect(result.roman).toBe('X');
  });

  it('returns error when API responds with error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => 'Invalid input'
    }));

    const result = await handleConvert('50');
    expect(result.error).toBe('Invalid input');
  });

  it('returns error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await handleConvert('20');
    expect(result.error).toBe('Network error');
  });
});
