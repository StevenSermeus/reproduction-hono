import { hc } from 'hono/client';

import { env } from '@/env';
import type { AppRoutes } from '@/server/index';

export const $api = hc<AppRoutes>(env.NEXT_PUBLIC_WEBSITE_URL, {
  init: {
    credentials: 'include',
  },
}).api;
