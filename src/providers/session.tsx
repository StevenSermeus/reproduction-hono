'use client';

import React, { useContext } from 'react';
import { createContext } from 'react';

import { InferResponseType } from 'hono';

import { useQuery } from '@tanstack/react-query';

import { $api } from '@/api/react';

const $get = $api.v1.auth.me.$get;

type MeResponse = InferResponseType<typeof $get, 200>;

/**
 * Represents the session state.
 *
 * @interface Session
 * @property {boolean} isLoading - Indicates whether the session data is currently being loaded.
 * @property {MeResponse | null} data - The session data, which is either a `MeResponse` object or `null` if no data is available.
 */
interface Session {
  isLoading: boolean;
  data: MeResponse | null;
}

export const SessionContext = createContext<Session>({ isLoading: true, data: null });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const query = useQuery({
    queryKey: ['auth', 'me'],
    refetchOnWindowFocus: 'always',
    queryFn: async () => {
      try {
        const res = await $api.v1.auth.me.$get();

        if (res.ok) {
          return await res.json();
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    retry: 0,
  });
  const value =
    query.data !== undefined && !query.isLoading
      ? { isLoading: false, data: query.data }
      : { isLoading: true, data: null };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => {
  const session = useContext(SessionContext);
  return session;
};
