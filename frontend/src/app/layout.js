import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from 'next/font/google';
import ClientProviders from '@/components/ClientProviders';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'WargaKlik - Sistem Iuran RT Digital',
  description: 'Sistem manajemen iuran RT modern yang transparan dan digital.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="antialiased text-slate-50 bg-slate-900 min-h-screen selection:bg-emerald-500/30">
        <ClientProviders midtransClientKey={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
