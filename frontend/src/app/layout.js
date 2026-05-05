'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased text-slate-50 bg-slate-900 min-h-screen selection:bg-emerald-500/30">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'glass',
              style: {
                background: 'rgba(30, 41, 59, 0.9)',
                color: '#f8fafc',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
            }}
          />
        </AuthProvider>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
