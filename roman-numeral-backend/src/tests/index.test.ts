import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll } from 'vitest';
import { toRoman } from '../utils/romanConverter';
import { logger } from '../logger';
import client from 'prom-client';
import cors from 'cors';

let app: express.Express;

beforeAll(async () => {
  app = express();
  app.use(cors());
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  const conversionCounter = new client.Counter({
    name: 'roman_conversion_total',
    help: 'Total number of successful Roman numeral conversions',
    labelNames: ['input'] as const,
  });
  register.registerMetric(conversionCounter);

  app.get('/ping', (_req, res) => res.send('pong'));

  app.get('/romannumeral', (req, res) => {
    const query = req.query.query as string;
    const num = parseInt(query, 10);
    if (!query || isNaN(num)) return res.status(400).send('Invalid or missing query parameter');
    try {
      const roman = toRoman(num);
      conversionCounter.inc({ input: query });
      res.json({ input: query, output: roman });
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  });

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
});

describe('API Tests', () => {
  it('/ping should return pong', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.text).toBe('pong');
  });

  it('/romannumeral should return Roman numeral', async () => {
    const res = await request(app).get('/romannumeral?query=123');
    expect(res.status).toBe(200);
    expect(res.body.output).toBe('CXXIII');
  });

  it('/romannumeral should return 400 for invalid query', async () => {
    const res = await request(app).get('/romannumeral?query=invalid');
    expect(res.status).toBe(400);
  });

  it('/metrics should return Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('# HELP roman_conversion_total');
  });
});
