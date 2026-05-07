'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Lock, Loader2, KeyRound } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[#f8fafc]">
        <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl">
          <p className="text-slate-500 font-medium mb-6">Akses tidak valid atau sesi telah berakhir.</p>
          <button 
            onClick={() => router.push('/reset-password')}
            className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-all"
          >
            Kembali ke Reset Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[#f8fafc] font-sans">
      <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200 text-center animate-fade-in relative overflow-hidden">
        
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-2xl mb-4 md:mb-6 shadow-inner">
          <KeyRound className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Password <span className="text-amber-500">Baru</span>
        </h1>
        <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed mb-8 md:mb-10">
          Silakan buat kata sandi baru untuk akun Anda.
        </p>

        <form onSubmit={handleSetPassword} className="space-y-4 md:space-y-6 text-left">
          <div className="space-y-2 md:space-y-3">
            <label className="block text-xs md:text-sm font-bold text-slate-700 ml-1">Kata Sandi Baru</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 md:h-5 md:w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-200 py-3.5 md:py-4 pl-11 md:pl-12 pr-4 text-slate-900 font-medium outline-none focus:border-amber-500 focus:bg-white transition-all rounded-xl md:rounded-2xl text-sm md:text-base"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            <label className="block text-xs md:text-sm font-bold text-slate-700 ml-1">Konfirmasi Kata Sandi</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 md:h-5 md:w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-200 py-3.5 md:py-4 pl-11 md:pl-12 pr-4 text-slate-900 font-medium outline-none focus:border-amber-500 focus:bg-white transition-all rounded-xl md:rounded-2xl text-sm md:text-base"
                placeholder="Ulangi kata sandi"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full group bg-amber-500 text-white py-3.5 md:py-4.5 mt-2 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
            ) : (
              'Simpan Kata Sandi Baru'
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <ResetSetPasswordForm />
    </Suspense>
  );
}
