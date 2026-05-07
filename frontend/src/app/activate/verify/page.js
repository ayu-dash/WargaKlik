'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import api from '@/utils/api';

function ActivateVerifyForm() {
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
      const res = await api.post('/auth/activate', { identifier });
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
      router.push(`/activate/set-password?identifier=${encodeURIComponent(identifier)}&otp=${encodeURIComponent(otpCode)}`);
    } catch (err) {
      toast.error(err.message || 'Kode OTP tidak valid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!identifier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md p-8 text-center shadow-sm rounded-xl border border-slate-100">
          <p className="text-slate-600 mb-4">Akses tidak valid. Email atau Nomor Telepon tidak ditemukan.</p>
          <button 
            onClick={() => router.push('/activate')}
            className="px-6 py-2 bg-[#003B8C] text-white rounded-md hover:bg-blue-800 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-lg text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-[#003B8C] mb-4">Verifikasi Akun Anda</h1>
        <p className="text-slate-600 mb-8">
          Kami telah mengirimkan kode verifikasi ke email atau WhatsApp Anda.
          Silakan masukkan 6 digit kode tersebut di bawah ini.
        </p>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-4" onPaste={handlePaste}>
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
                className="w-12 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003B8C] focus:bg-white transition-all shadow-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.join('').length < 6}
            className="w-full py-4 bg-[#003B8C] hover:bg-blue-800 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              'Verifikasi Sekarang'
            )}
          </button>
          
          <div className="mt-6 text-sm text-slate-600">
            Belum menerima kode?{' '}
            <button 
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isSubmitting}
              className="font-semibold text-[#003B8C] hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Kirim Ulang (${countdown}s)` : 'Kirim Ulang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ActivateVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#003B8C]" />
      </div>
    }>
      <ActivateVerifyForm />
    </Suspense>
  );
}
