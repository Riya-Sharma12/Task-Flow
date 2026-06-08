import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Indexcard — A task ledger',
  description: 'A clean task management landing page for finishers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              letterSpacing: '0.05em',
              borderRadius: '0',
              border: '2px solid var(--ink)',
            },
          }}
        />
      </body>
    </html>
  );
}
