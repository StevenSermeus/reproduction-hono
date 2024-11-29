import { OpenAPIHono } from '@hono/zod-openapi';

import { defaultHook } from '@/server/middleware/zod-handle';

import { createStoryStepRouter } from './create';

export const storyStepRouter = new OpenAPIHono({
  defaultHook: defaultHook,
}).route('/', createStoryStepRouter);
