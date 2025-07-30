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

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Prometheus metrics
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  const conversionCounter = new client.Counter({
    name: 'roman_conversion_total',
    help: 'Total number of successful Roman numeral conversions',
    labelNames: ['input'] as const,
  });
  register.registerMetric(conversionCounter);

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
      return res.status(400).send('Invalid or missing query parameter');
    }

    try {
      const roman = toRoman(num);
      conversionCounter.inc({ input: query });
      logger.info(`Converted ${num} to ${roman}`);
      res.json({ input: query, output: roman });
    } catch (err) {
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
