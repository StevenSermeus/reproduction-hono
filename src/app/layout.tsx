import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { cn } from "@/lib/utils";
import { Providers } from "@/providers/providers";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Template",
  description:
    "A template for Next.js with TypeScript, Tailwind CSS, and React Query. Use Hono for API requests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(montserrat, `min-h-screen antialiased`)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <main className="w-full overflow-x-hidden">{children}</main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
