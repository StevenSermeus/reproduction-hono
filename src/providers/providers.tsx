import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';
import ReactQueryProvider from '@/providers/react-query';
import { ThemeProvider } from '@/providers/theme-provider';

import { SessionProvider } from './session';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        <NuqsAdapter>
          <Toaster />
          <ThemeProvider>{children}</ThemeProvider>
        </NuqsAdapter>
      </SessionProvider>
    </ReactQueryProvider>
  );
}
