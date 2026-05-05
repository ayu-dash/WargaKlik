'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

export default function ClientProviders({ children, midtransClientKey }) {
  return (
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
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={midtransClientKey}
        strategy="lazyOnload"
      />
    </AuthProvider>
  );
}
