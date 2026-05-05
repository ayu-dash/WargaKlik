'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Receipt, 
  History, 
  Bell, 
  Megaphone, 
  Users, 
  WalletCards, 
  FileText, 
  Settings,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  UserCog
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  const menuGroups = [
    {
      title: 'Menu Utama',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: true },
        { name: 'Pengumuman', path: '/dashboard/pengumuman', icon: Megaphone, show: true },
        { name: 'Notifikasi', path: '/dashboard/notifikasi', icon: Bell, show: true },
        { name: 'Profil Saya', path: '/dashboard/profil', icon: UserCog, show: true },
      ]
    },
    {
      title: 'Menu Warga',
      items: [
        { name: 'Tagihan Saya', path: '/dashboard/tagihan', icon: Receipt, show: hasRole('warga') }
      ]
    },
    {
      title: 'Transparansi Keuangan',
      items: [
        { name: 'Kas Harian', path: '/dashboard/admin/kas', icon: History, show: true },
        { name: 'Laporan Keuangan', path: '/dashboard/admin/laporan', icon: FileText, show: true },
      ]
    },
    {
      title: 'Pengurus RT',
      items: [
        { name: 'Data Warga', path: '/dashboard/admin/warga', icon: Users, show: hasRole(['rt', 'wakil_rt', 'sekretaris', 'bendahara']) },
        { name: 'Data Iuran', path: '/dashboard/admin/iuran', icon: WalletCards, show: hasRole(['rt', 'wakil_rt', 'sekretaris', 'bendahara']) },
        { name: 'Kelola Tagihan', path: '/dashboard/admin/tagihan', icon: Receipt, show: hasRole(['rt', 'wakil_rt', 'bendahara', 'sekretaris']) }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 glass border-r border-slate-700/50 
        transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-500 font-bold">RT</span>
            </div>
            <span className="text-xl font-bold text-white tracking-wide">Web Iuran</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
          {menuGroups.map((group, idx) => {
            const visibleItems = group.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="mb-8">
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link 
                        key={item.path} 
                        href={item.path}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${active 
                            ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                        `}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <UserIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
