import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import SupabaseProvider from '@/components/supabase-provider';
import { Toaster as SonnerToaster } from "sonner";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BiteSync',
  description: 'AI-Powered Project Scheduling Coordination Tool',
  icons: {
    icon: '/favicon-32x32.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <SupabaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="relative flex min-h-screen flex-col">
              {children}
            </main>
            <Toaster />
            <SonnerToaster />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}