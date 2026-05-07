'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Mail, Key, Lock, Loader2, ArrowRight } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Activate() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email wajib diisi');

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/activate', { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || !password || !passwordConfirm) {
      return toast.error('Semua field wajib diisi');
    }
    if (password !== passwordConfirm) {
      return toast.error('Password dan konfirmasi tidak cocok');
    }
    if (password.length < 6) {
      return toast.error('Password minimal 6 karakter');
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        email,
        otp_code: otp,
        password
      });

      toast.success('Akun berhasil diaktifkan!');

      // Auto login logic handled in context via cookies if we want, but let's just redirect to login
      // Actually API returns tokens on verify, but context needs to refresh.
      // Redirecting to login is safer flow.
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Gagal verifikasi OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mb-4 border border-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Aktivasi Akun</h1>
          <p className="text-slate-400">
            {step === 1 ? 'Masukkan email yang terdaftar pada pengurus RT' : 'Masukkan OTP dan buat password baru'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 ml-1">Email Terdaftar</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 py-3.5 md:py-4 pl-11 md:pl-12 pr-4 text-slate-900 font-medium outline-none focus:border-primary focus:bg-white transition-all rounded-xl md:rounded-2xl text-sm md:text-base"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex justify-center items-center py-3"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Kirim Kode OTP <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </button>
          </form>
        ) : (
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
              <p className="text-xs text-slate-500 mt-2">Cek email atau WhatsApp Anda</p>
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
              className="w-full btn-primary flex justify-center items-center py-3 mt-4"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Aktifkan Akun'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-slate-400 text-sm hover:text-white transition-colors"
            >
              Kembali ke langkah 1
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-slate-400 relative z-10">
          Sudah punya akun aktif?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
