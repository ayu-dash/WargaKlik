'use client';

import { Menu, Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import Link from 'next/link';

export default function TopBar({ setIsSidebarOpen }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchNotif = async () => {
        try {
          const res = await api.get('/notifikasi');
          if (res.data.success) {
            setUnreadCount(res.data.pagination.unread_count);
          }
        } catch (err) {}
      };
      fetchNotif();
      const interval = setInterval(fetchNotif, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shadow-sm shadow-slate-100/50">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2.5 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Wilayah RT Digital</span>
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <h2 className="text-sm font-bold text-slate-700">
            Selamat Datang, {user?.name?.split(' ')[0]}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/notifikasi" 
          className="relative p-3 text-slate-500 hover:text-primary rounded-2xl hover:bg-emerald-50 transition-all group"
        >
          <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-danger rounded-full border-2 border-white"></span>
          )}
        </Link>
        
        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />
        
        <Link href="/dashboard/profil" className="flex items-center gap-3 pl-2 group">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-primary/30 group-hover:bg-emerald-50 transition-all">
            <User className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>
    </header>
  );
}
