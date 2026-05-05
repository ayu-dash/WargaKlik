'use client';

import { Menu, Bell } from 'lucide-react';
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
      // Optional: Polling every 1 minute
      const interval = setInterval(fetchNotif, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className="h-16 glass border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-white hidden sm:block">
          Sistem Informasi Iuran RT
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/dashboard/notifikasi" className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
          )}
        </Link>
      </div>
    </header>
  );
}
