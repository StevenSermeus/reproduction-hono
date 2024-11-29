import { cookies } from 'next/headers';

import { hc } from 'hono/client';

import { env } from '@/env';
import type { AppRoutes } from '@/server/index';

export const $api = hc<AppRoutes>(env.NEXT_PUBLIC_WEBSITE_URL, {
  init: {
    credentials: 'include',
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetch(input, requestInit, _Env, _executionCtx) {
    const cookies_header = cookies();
    const res = await fetch(input, {
      ...requestInit,
      headers: {
        cookie: `access_token=${cookies_header.get('access_token')?.value}`,
      },
    });

    return res;
  },
}).api;
