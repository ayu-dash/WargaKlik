'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { KeyRound, Mail, Loader2, ArrowRight } from 'lucide-react';
import api from '@/utils/api';

export default function ResetPassword() {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!identifier) return toast.error('Email atau Nomor Telepon wajib diisi');

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { identifier });
      toast.success(res.data.message);
      // Redirect ke halaman verifikasi terpisah
      router.push(`/reset-password/verify?identifier=${encodeURIComponent(identifier)}`);
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mb-4 border border-amber-500/20">
            <KeyRound className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400">
            Masukkan email atau nomor telepon Anda untuk menerima kode OTP
          </p>
        </div>

        <form onSubmit={handleRequestOtp} className="space-y-6 relative z-10">
          <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Email / No. Telepon</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                 type="text"
                className="input-field pl-10"
                placeholder="Email atau Nomor Telepon"
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
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)' }}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Kirim Kode OTP <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400 relative z-10">
          Ingat password Anda?{' '}
          <Link href="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
