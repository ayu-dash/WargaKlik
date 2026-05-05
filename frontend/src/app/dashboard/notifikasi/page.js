'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Bell, Check, Trash2, Clock } from 'lucide-react';
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
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-10 bg-slate-800/50 rounded-xl w-48 mb-6 animate-pulse"></div>
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-400" />
          Notifikasi
        </h1>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Tandai semua dibaca
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`glass-card p-5 flex gap-4 transition-all ${
                notif.is_read ? 'opacity-70 border-transparent bg-slate-800/30' : 'border-emerald-500/30 bg-slate-800/60'
              }`}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
            >
              <div className="flex-shrink-0 mt-1">
                <div className={`w-2 h-2 mt-1.5 rounded-full ${notif.is_read ? 'bg-transparent' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-medium ${notif.is_read ? 'text-slate-300' : 'text-white'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(notif.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Belum ada notifikasi</h3>
          <p className="text-slate-400">Notifikasi tagihan dan pengumuman akan muncul di sini.</p>
        </div>
      )}
    </div>
  );
}
