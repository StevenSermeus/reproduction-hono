import { hc } from 'hono/client';

import { env } from '@/env';
import type { AppRoutes } from '@/server/index';

export const $api = hc<AppRoutes>(env.NEXT_PUBLIC_WEBSITE_URL, {
  init: {
    credentials: 'include',
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetch(input, requestInit, _Env, _executionCtx) {
    const res = await fetch(input, requestInit);
    if (res.status === 401 && !input.toString().includes('auth/token/renew')) {
      const resRenew = await $api.v1.auth.token.renew.$get();
      if (resRenew.ok) {
        console.log('Token has been renewed in the background');
        return fetch(input, requestInit);
      }
      console.log('Failed to renew token');
      Promise.reject(res);
    }

    return res;
  },
}).api;
