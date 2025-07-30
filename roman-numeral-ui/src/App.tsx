import { useState } from 'react';
import {
  Provider,
  defaultTheme,
  TextField,
  Button,
  Heading,
  View,
  Text,
  Flex
} from '@adobe/react-spectrum';
import { useSystemColorScheme } from './hooks/useSystemColorScheme';
import { handleConvert } from './utils/handleConvert';
import { context, trace } from '@opentelemetry/api';

/**
 * App component renders a Roman numeral converter interface.
 * It uses Adobe React Spectrum components and fetches conversion results
 * from a backend service based on numeric input (1–3999).
 */
function App() {
  const [input, setInput] = useState('');
  const [roman, setRoman] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useSystemColorScheme();

  const onSubmit = async () => {
    const tracer = trace.getTracer('roman-ui');
    const span = tracer.startSpan('convert-button-click');

    context.with(trace.setSpan(context.active(), span), async () => {
      setRoman(null);
      setError(null);
      setLoading(true);

      try {
        const { roman: result, error: err } = await handleConvert(input);

        if (err) {
          const errorSpan = tracer.startSpan('render-error');
          setError(err);
          errorSpan.end();
        } else {
          const renderSpan = tracer.startSpan('render-result');
          setRoman(result!);
          renderSpan.end();
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        const catchSpan = tracer.startSpan('render-catch-error');
        setError('Unexpected error');
        catchSpan.end();
      } finally {
        span.end();
        setLoading(false);
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload on Enter
    if (!loading && input) {
      onSubmit();
    }
  };
  return (
    <Provider theme={defaultTheme} colorScheme={colorScheme}>
      <View
        height="100vh"
        width="100vw"
        paddingX={{ base: 'size-200', M: 'size-300' }}
        backgroundColor="gray-50"
      >
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <View
            backgroundColor="gray-100"
            padding={{ base: 'size-200', M: 'size-400' }}
            width={{ base: '100%', M: 'size-4600' }}
            borderRadius="large"
            maxWidth="size-4600"
            UNSAFE_style={{
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
            }}
          >
            <form onSubmit={handleFormSubmit}>
              <Flex direction="column" gap="size-200">
                <Heading level={2}>Roman Numeral Converter</Heading>

                <TextField
                  label="Enter a number (1-3999)"
                  value={input}
                  onChange={setInput}
                  isDisabled={loading}
                  type="number"
                  inputMode="numeric"
                  minLength={1}
                  maxLength={4}
                  isRequired
                  necessityIndicator="icon"
                />

                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={loading || input === ''}
                >
                  Convert to roman numeral
                </Button>

                {roman && <Text><strong>Roman numeral:</strong> {roman}</Text>}
                {error && <Text UNSAFE_style={{ color: 'red' }}>{error}</Text>}
              </Flex>
            </form>
          </View>
        </Flex>
      </View>
    </Provider>
  );
}

export default App;
