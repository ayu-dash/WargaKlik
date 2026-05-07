'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Loader2, ArrowLeft, ShieldCheck, ChevronRight, UserCircle2 } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Email/Nomor Telepon dan password wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier, password);
      toast.success('Selamat Datang! Login berhasil');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Email atau password salah');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[#f8fafc] relative selection:bg-primary/20 selection:text-primary overflow-hidden font-sans">
      <div className="fixed inset-0 community-grid opacity-40 pointer-events-none -z-10" />
      
      {/* Back to Home */}
      <Link href="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 md:gap-3 text-slate-500 hover:text-primary transition-all text-xs md:text-sm font-bold group">
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
        Kembali
      </Link>

      <div className="w-full max-w-[460px] animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-2xl mb-4 md:mb-6 shadow-inner">
              <UserCircle2 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Masuk ke Portal <span className="text-primary">Warga</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              Silakan masukkan email atau nomor telepon dan kata sandi Anda untuk mengakses dashboard RT.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-2 md:space-y-3">
              <label className="block text-xs md:text-sm font-bold text-slate-700 ml-1">Email atau Nomor Telepon</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 md:h-5 md:w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 py-3.5 md:py-4 pl-11 md:pl-12 pr-4 text-slate-900 font-medium outline-none focus:border-primary focus:bg-white transition-all rounded-xl md:rounded-2xl text-sm md:text-base"
                  placeholder="Email atau No. Telepon"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs md:text-sm font-bold text-slate-700">Kata Sandi</label>
                <Link href="/reset-password" name="reset-password-link" className="text-[10px] md:text-xs font-bold text-primary hover:underline transition-colors">
                  Lupa Kata Sandi?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 md:h-5 md:w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 py-3.5 md:py-4 pl-11 md:pl-12 pr-4 text-slate-900 font-medium outline-none focus:border-primary focus:bg-white transition-all rounded-xl md:rounded-2xl text-sm md:text-base"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group bg-primary text-white py-3.5 md:py-4.5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              ) : (
                <>Masuk Sekarang <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-100 text-center">
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Belum punya akun aktif? <br />
              <Link href="/activate" className="text-primary hover:underline font-bold mt-1.5 md:mt-2 inline-block text-sm md:text-base">
                Aktivasi Akun Sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Support Notice */}
        <div className="mt-6 md:mt-8 text-center space-y-2">
          <p className="text-slate-400 text-xs md:text-sm font-medium">Butuh bantuan masuk? Hubungi pengurus RT.</p>
          <div className="flex items-center justify-center gap-3 md:gap-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Sistem Aman</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Enkripsi SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
