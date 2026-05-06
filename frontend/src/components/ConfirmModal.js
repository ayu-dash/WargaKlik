'use client';

import { X, AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Konfirmasi Hapus', 
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  isLoading = false,
  variant = 'danger'
}) {
  if (!isOpen) return null;

  const variantColors = {
    danger: {
      iconBg: 'bg-red-50',
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 shadow-red-200',
    },
    warning: {
      iconBg: 'bg-amber-50',
      icon: 'text-amber-500',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    },
    primary: {
      iconBg: 'bg-emerald-50',
      icon: 'text-primary',
      button: 'bg-primary hover:bg-primary-hover shadow-primary/20',
    }
  };

  const style = variantColors[variant] || variantColors.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md p-6 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className={`w-20 h-20 ${style.iconBg} rounded-3xl flex items-center justify-center shadow-inner`}>
            <AlertTriangle className={`w-10 h-10 ${style.icon}`} />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm active:scale-95 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-4 px-6 ${style.button} text-white font-bold rounded-2xl shadow-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
