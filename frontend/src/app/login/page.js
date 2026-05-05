'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Loader2, ArrowLeft, ShieldCheck, ChevronRight, UserCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Selamat Datang! Login berhasil');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Email atau password salah');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] relative selection:bg-primary/20 selection:text-primary overflow-hidden font-sans">
      <div className="fixed inset-0 community-grid opacity-40 pointer-events-none -z-10" />
      
      {/* Back to Home */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 text-slate-500 hover:text-primary transition-all text-sm font-bold group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-[460px] animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-2xl mb-6 shadow-inner">
              <UserCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Masuk ke Portal <span className="text-primary">Warga</span>
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Silakan masukkan email dan kata sandi Anda untuk mengakses dashboard RT.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 ml-1">Alamat Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 text-slate-900 font-medium outline-none focus:border-primary focus:bg-white transition-all rounded-2xl"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="block text-sm font-bold text-slate-700">Kata Sandi</label>
                <Link href="/reset-password" name="reset-password-link" className="text-xs font-bold text-primary hover:underline transition-colors">
                  Lupa Kata Sandi?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 text-slate-900 font-medium outline-none focus:border-primary focus:bg-white transition-all rounded-2xl"
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
              className="w-full group bg-primary text-white py-4.5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>Masuk Sekarang <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              Belum punya akun aktif? <br />
              <Link href="/activate" className="text-primary hover:underline font-bold mt-2 inline-block">
                Aktivasi Akun Sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Support Notice */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-400 text-sm font-medium">Butuh bantuan masuk? Hubungi pengurus RT.</p>
          <div className="flex items-center justify-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sistem Aman</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Enkripsi SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
