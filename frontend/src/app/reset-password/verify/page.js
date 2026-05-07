'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import api from '@/utils/api';

function ResetVerifyForm() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

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
    const otpCode = otp.join('');
    if (otpCode.length < 6) return toast.error('Silakan masukkan 6 digit kode OTP');

    setIsSubmitting(true);
    try {
      await api.post('/auth/validate-otp', { identifier, otp_code: otpCode });
      router.push(`/reset-password/set-password?identifier=${encodeURIComponent(identifier)}&otp=${encodeURIComponent(otpCode)}`);
    } catch (err) {
      toast.error(err.message || 'Kode OTP tidak valid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!identifier) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[#f8fafc]">
        <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl">
          <p className="text-slate-500 font-medium mb-6">Akses tidak valid. Sesi Anda mungkin telah berakhir.</p>
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
        
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
          Verifikasi <span className="text-amber-500">Akun Anda</span>
        </h1>
        <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed mb-8">
          Kami telah mengirimkan kode verifikasi ke email atau WhatsApp Anda.
          Silakan masukkan <span className="font-bold text-slate-700">6 digit</span> kode tersebut di bawah ini.
        </p>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-amber-500 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all shadow-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.join('').length < 6}
            className="w-full bg-amber-500 text-white py-3.5 md:py-4.5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              'Verifikasi Sekarang'
            )}
          </button>
          
          <div className="mt-6 pt-6 border-t border-slate-100 text-sm md:text-base text-slate-500 font-medium">
            Belum menerima kode?{' '}
            <button 
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isSubmitting}
              className="text-amber-500 font-bold hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed ml-1"
            >
              {countdown > 0 ? `Kirim Ulang (${countdown}s)` : 'Kirim Ulang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <ResetVerifyForm />
    </Suspense>
  );
}
