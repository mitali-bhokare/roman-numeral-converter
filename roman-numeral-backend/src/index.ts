import './tracing';
import express from 'express';
import cors from 'cors';
import { toRoman } from './utils/romanConverter';
import { logger } from './logger';
import client from 'prom-client';

const PORT = 8080;

function startServer() {
  const app = express();

  // Enable CORS
  app.use(cors());

  // Prometheus metrics
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  // Total conversions metrics
  const conversionCounter = new client.Counter({
    name: 'roman_conversion_total',
    help: 'Total number of successful Roman numeral conversions',
    labelNames: ['input'] as const,
  });
  register.registerMetric(conversionCounter);

  //Total failed conversions
  const failedConversionCounter = new client.Counter({
    name: 'roman_conversion_failures_total',
    help: 'Number of failed Roman numeral conversions',
  });
  register.registerMetric(failedConversionCounter);

  //HTTP request counter by method/route/status
  const requestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });
  register.registerMetric(requestCounter);

  //Request duration histogram
  const requestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
  });
  register.registerMetric(requestDuration);


  // Request logging + metrics middleware
  app.use((req, res, next) => {
    const endTimer = requestDuration.startTimer({ method: req.method, route: req.path });

    res.on('finish', () => {
      requestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
      endTimer({ status: res.statusCode });
      logger.info(`${req.method} ${req.url} → ${res.statusCode}`);
    });

    next();
  });

  // Health check
  app.get('/ping', (_req, res) => {
    logger.info('Received /ping');
    res.send('pong');
  });

  // Roman numeral API
  app.get('/romannumeral', (req, res) => {
    const query = req.query.query as string;
    const num = parseInt(query, 10);

    if (!query || isNaN(num)) {
      logger.warn(`Invalid query parameter: ${query}`);
      failedConversionCounter.inc();
      return res.status(400).send('Invalid or missing query parameter');
    }

    try {
      const roman = toRoman(num);
      conversionCounter.inc({ input: query });
      logger.info(`Converted ${num} to ${roman}`);
      res.json({ input: query, output: roman });
    } catch (err) {
      failedConversionCounter.inc();
      logger.error(`Conversion error for input "${query}"`, err);
      res.status(400).send((err as Error).message);
    }
  });

  // Metrics endpoint
  app.get('/metrics', async (_req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      logger.error('Failed to fetch metrics', err);
      res.status(500).send('Could not load metrics');
    }
  });

  // Fallback error handler
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error in middleware', err);
    res.status(500).send('Internal Server Error');
  });

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
