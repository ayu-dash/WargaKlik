'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Mail, Loader2, ArrowRight } from 'lucide-react';
import api from '@/utils/api';

export default function Activate() {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!identifier) return toast.error('Email atau Nomor Telepon wajib diisi');

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/activate', { identifier });
      toast.success(res.data.message);
      // Redirect ke halaman verifikasi terpisah
      router.push(`/activate/verify?identifier=${encodeURIComponent(identifier)}`);
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim OTP');
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
            Masukkan email atau nomor telepon yang terdaftar pada pengurus RT
          </p>
        </div>

        <form onSubmit={handleRequestOtp} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-700 ml-1">Email / Nomor Telepon Terdaftar</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
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
