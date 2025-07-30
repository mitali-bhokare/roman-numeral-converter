import { trace } from '@opentelemetry/api';

/**
 * Converts a numeric string input to a Roman numeral by calling a backend API.
 *
 * Performs frontend validation to ensure the number is between 1 and 3999.
 * Returns either a Roman numeral result or an error message.
 *
 * @param input - A string containing the number to convert
 * @returns A Promise resolving to an object with either `roman` or `error` key
 */

export async function handleConvert(input: string): Promise<{ roman?: string; error?: string }> {
  const tracer = trace.getTracer('roman-ui');
  const span = tracer.startSpan('fetch-roman-numeral');

  const value = parseInt(input, 10);
  if (isNaN(value) || value < 1 || value > 3999) {
    return { error: 'Please enter a number between 1 and 3999.' };
  }

  try {
    const response = await fetch(`http://localhost:8080/romannumeral?query=${input}`);
    if (!response.ok) {
      span.setStatus({ code: 2, message: `HTTP error: ${response.status}` });
      const text = await response.text();
      return { error: text || 'Failed to fetch result' };
    }

    const data = await response.json();
    span.setStatus({ code: 1 }); // success
    return { roman: data.output };
  } catch (err: any) {
    span.setStatus({ code: 2, message: (err as Error).message });
    return { error: err.message || 'Something went wrong' };
  } finally {
    span.end();
  }
}