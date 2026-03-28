import { Hono } from 'hono';
import type { HealthResponse } from '@blindspot/shared';

/**
 * Health check route
 * Per D-07: Basic service status endpoint
 */
export const healthRoute = new Hono();

// Track server start time (set by index.ts)
let serverStartTime: number = Date.now();

export function setServerStartTime(time: number) {
  serverStartTime = time;
}

healthRoute.get('/health', (c) => {
  const uptime_ms = Date.now() - serverStartTime;

  const response: HealthResponse = {
    status: "ok",
    version: "0.1.0",
    uptime_ms
  };

  return c.json(response);
});
