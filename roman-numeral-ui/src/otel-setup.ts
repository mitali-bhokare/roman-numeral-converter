import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { resourceFromAttributes } from '@opentelemetry/resources';

// Create an OTLP exporter with the trace endpoint (mapped in Docker or dev server)
const exporter = new OTLPTraceExporter({
    url: `${window.location.origin}/v1/traces`,
});

// Create a processor that batches spans before sending them
const spanProcessor = new BatchSpanProcessor(exporter);

// Initialize the tracer provider with resource metadata (e.g., service name)
const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
        [SemanticResourceAttributes.SERVICE_NAME]: 'roman-numeral-frontend',
    }),
    spanProcessors: [spanProcessor],
});

// Register the tracer so OpenTelemetry starts capturing traces
provider.register();

// Enable automatic instrumentation for fetch() requests
registerInstrumentations({
    instrumentations: [new FetchInstrumentation()],
});

console.log('OpenTelemetry frontend tracing initialized');
