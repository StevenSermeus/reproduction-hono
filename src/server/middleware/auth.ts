import { deleteCookie, getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { JwtTokenExpired } from 'hono/utils/jwt/types';

import { z } from '@hono/zod-openapi';
import { Roles } from '@prisma/client';

import { env } from '@/env';
import prisma from '@/libs/prisma';
import { AuthorizedCounter, UnauthorizedCounter } from '@/libs/prometheus';

export const protectedRoute = createMiddleware(async (c, next) => {
  const access_token = getCookie(c, 'access_token');
  if (!access_token) {
    return c.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const payload = (await verify(access_token, env.JWT_ACCESS_SECRET)) as { user_id: string };
    c.set('user_id', payload.user_id);
  } catch (e) {
    if (e instanceof JwtTokenExpired) {
      deleteCookie(c, 'access_token');
      UnauthorizedCounter.inc(1);
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }
  AuthorizedCounter.inc(1);
  return next();
});

export const protectedRouteResponse = {
  401: {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: z.object({
          message: z.string(),
        }),
      },
    },
  },
};

export const authorizedRoles = (roles: Roles[]) => {
  if (roles.length === 0) {
    throw new Error('Roles cannot be empty');
  }
  return createMiddleware(async (c, next) => {
    const user_id = c.get('user_id');
    if (!user_id) {
      throw new Error(
        'The protectedRoute middleware should be used before the authorized middleware'
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
    if (user === null) {
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!roles.includes(user.role)) {
      return c.json({ message: 'Permission denied' }, { status: 403 });
    }
    c.set('user', user);
    return next();
  });
};

export const authorizedResponse = {
  401: {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: z.object({
          message: z.string(),
        }),
      },
    },
  },
};
