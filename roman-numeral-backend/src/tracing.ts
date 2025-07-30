import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Enable debug logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://jaeger:14268/api/traces' // Jaeger Collector endpoint
});

const sdk = new NodeSDK({
  //serviceName: 'roman-numeral-backend',
  traceExporter: jaegerExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  resource: resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'roman-numeral-backend',
  }),
  
});

try {
  sdk.start();
  console.log(' OpenTelemetry tracing initialized');
} catch (error) {
  console.error('Error initializing OpenTelemetry', error);
}

// graceful shutdown support
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((err) => console.log('Error terminating tracing', err))
    .finally(() => process.exit(0));
});
