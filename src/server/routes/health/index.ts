import { z } from 'zod';

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import { rateLimitOpenApiResponse, rateLimiterMiddleware } from '@/server/middleware/rate-limiter';
import type { VariablesHono } from '@/server/variables';

export const healthRouteOpenApi = createRoute({
  method: 'get',
  description: 'Health',
  tags: ['Health'],
  path: '/health',
  security: [],
  middleware: [rateLimiterMiddleware({ windowMs: 15 * 60 * 1000, limit: 100, key: 'health' })],
  responses: {
    ...rateLimitOpenApiResponse,
    200: {
      description: 'Login Successful',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
          }),
        },
      },
    },
  },
});

const health = new OpenAPIHono<{ Variables: VariablesHono }>();

export const healthRoute = health.openapi(healthRouteOpenApi, async c => {
  return c.json({ status: 'ok' }, 200);
});
