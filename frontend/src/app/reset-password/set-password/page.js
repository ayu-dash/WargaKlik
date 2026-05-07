'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Lock, Loader2 } from 'lucide-react';
import api from '@/utils/api';

function ResetSetPasswordForm() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  const otpCode = searchParams.get('otp');
  
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!password || !passwordConfirm) return toast.error('Semua field wajib diisi');
    if (password !== passwordConfirm) return toast.error('Password dan konfirmasi tidak cocok');
    if (password.length < 6) return toast.error('Password minimal 6 karakter');

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { identifier, otp_code: otpCode, password });
      toast.success('Password berhasil direset! Silakan login.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Gagal mereset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!identifier || !otpCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md p-8 text-center shadow-sm rounded-xl border border-slate-100">
          <p className="text-slate-600 mb-4">Sesi tidak valid atau telah berakhir.</p>
          <button 
            onClick={() => router.push('/reset-password')}
            className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-amber-500 mb-4">Password Baru</h1>
        <p className="text-slate-600 mb-8">
          Silakan buat password baru untuk akun Anda.
        </p>

        <form onSubmit={handleSetPassword} className="space-y-5 text-left">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password Baru</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-900"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-900"
                placeholder="Ulangi password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              'Simpan Password Baru'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetSetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <ResetSetPasswordForm />
    </Suspense>
  );
}
