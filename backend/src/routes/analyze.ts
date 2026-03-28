import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createMockAnalysis } from '../mocks/analysis-mock.js';

/**
 * Analysis route
 * Per D-04: Zod validation for request schema
 * Per D-08: POST /v1/analyze endpoint contract
 */
export const analyzeRoute = new Hono();

// Zod schema for AnalysisRequest validation
const requestSchema = z.object({
  url: z.string().url(),
  locale: z.string().optional(),
  timeout_ms: z.number().positive().optional()
});

analyzeRoute.post('/v1/analyze', zValidator('json', requestSchema), (c) => {
  const body = c.req.valid('json');

  // Call mock analysis generator
  const analysis = createMockAnalysis(body.url);

  return c.json(analysis, 200);
});
