'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { KeyRound, Key, Lock, Loader2 } from 'lucide-react';
import api from '@/utils/api';

function ResetVerifyForm() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOtp = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.post('/auth/forgot-password', { identifier });
      toast.success(res.data.message);
      setCountdown(60);
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim ulang OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || !password || !passwordConfirm) return toast.error('Semua field wajib diisi');
    if (password !== passwordConfirm) return toast.error('Password dan konfirmasi tidak cocok');
    if (password.length < 6) return toast.error('Password minimal 6 karakter');

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { identifier, otp_code: otp, password });
      toast.success('Password berhasil direset! Silakan login.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Gagal verifikasi OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!identifier) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <p className="text-slate-300 mb-4">Akses tidak valid. Email atau Nomor Telepon tidak ditemukan.</p>
          <button 
            onClick={() => router.push('/reset-password')}
            className="btn-primary px-6 py-2 bg-amber-500 hover:bg-amber-600"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mb-4 border border-amber-500/20">
            <KeyRound className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Validasi OTP</h1>
          <p className="text-slate-400">Masukkan OTP dan buat password baru</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Kode OTP</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                className="input-field pl-10 tracking-widest text-lg font-mono"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-500">Cek email atau WhatsApp Anda</p>
              <button 
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isSubmitting}
                className="text-xs font-medium text-amber-500 hover:text-amber-400 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
              >
                {countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim Ulang OTP'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password Baru</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                className="input-field pl-10"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Konfirmasi Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                className="input-field pl-10"
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
            className="w-full btn-primary flex justify-center items-center py-3 mt-4 hover:bg-amber-600"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)' }}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Simpan Password Baru'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/reset-password')}
            className="w-full text-slate-400 text-sm hover:text-white transition-colors"
          >
            Ganti Email / Nomor Telepon
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <ResetVerifyForm />
    </Suspense>
  );
}
