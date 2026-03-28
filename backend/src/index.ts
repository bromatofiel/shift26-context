import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { healthRoute, setServerStartTime } from './routes/health.js';
import { analyzeRoute } from './routes/analyze.js';

/**
 * BlindSpot Backend API
 * Hono-based server for bias analysis
 */

const app = new Hono();

// Track server start time for uptime calculation
const serverStartTime = Date.now();
setServerStartTime(serverStartTime);

// Register routes
app.route('/', healthRoute);
app.route('/', analyzeRoute);

// Start server
const port = 3001;

console.log(`🚀 BlindSpot API starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✓ Server running at http://localhost:${info.port}`);
});
