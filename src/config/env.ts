import { z } from 'zod';

import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  server: {

  },
  client: {
    NEXT_PUBLIC_WEBSITE_URL: z.string().url().default('http://localhost:3000'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
  },
  skipValidation: process.env.NODE_ENV === 'test',
});
