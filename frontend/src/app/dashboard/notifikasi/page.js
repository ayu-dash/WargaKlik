'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Bell, Check, Trash2, Clock, CheckCircle2, AlertCircle, Info, ChevronRight, Inbox } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDateTime } from '@/utils/format';

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifikasi');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifikasi/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      toast.error('Gagal menandai dibaca');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifikasi/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('Semua notifikasi ditandai dibaca');
    } catch (err) {
      toast.error('Gagal memproses permintaan');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-10 bg-slate-200 rounded-xl w-48 mb-6 animate-pulse"></div>
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-white border border-slate-100 rounded-[2rem] animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-10 relative">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Kotak <span className="text-primary">Notifikasi</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Informasi terbaru mengenai iuran dan lingkungan.</p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllAsRead}
            className="bg-primary/5 text-primary px-6 py-3 font-bold rounded-2xl hover:bg-primary/10 transition-all flex items-center gap-2 border border-primary/10"
          >
            <CheckCircle2 className="w-5 h-5" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="grid gap-6">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              className={`bg-white p-8 rounded-[2.5rem] border-2 flex gap-6 transition-all cursor-pointer relative overflow-hidden group ${
                notif.is_read ? 'border-slate-100 opacity-80' : 'border-primary ring-4 ring-primary/5 shadow-xl'
              }`}
            >
              <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                notif.is_read ? 'bg-slate-100 text-slate-400' : 'bg-primary text-white shadow-lg shadow-primary/20'
              }`}>
                {notif.is_read ? <Bell className="w-8 h-8" /> : <Bell className="w-8 h-8 animate-bounce-slow" />}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <h3 className={`text-xl font-black tracking-tight ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                    {notif.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-primary/60" />
                    {formatDateTime(notif.created_at)}
                  </div>
                </div>
                <p className={`text-lg font-medium leading-relaxed ${notif.is_read ? 'text-slate-400' : 'text-slate-600'}`}>
                  {notif.message}
                </p>
                
                {!notif.is_read && (
                  <div className="pt-4 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                     <span className="w-2 h-2 bg-primary rounded-full"></span>
                     Pesan Baru
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center justify-center pl-4">
                 <ChevronRight className={`w-6 h-6 transition-all ${notif.is_read ? 'text-slate-200' : 'text-primary/40 group-hover:translate-x-1 group-hover:text-primary'}`} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-200 p-20 text-center rounded-[3rem] flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Inbox className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Kotak Kosong</h3>
          <p className="text-slate-500 font-medium max-w-sm">Belum ada notifikasi baru untuk Anda saat ini.</p>
        </div>
      )}
    </div>
  );
}
