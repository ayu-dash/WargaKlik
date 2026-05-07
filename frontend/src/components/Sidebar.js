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
  UserCog,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path, exact = false) => {
    if (exact) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const menuGroups = [
    {
      title: 'Utama',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: true, exact: true },
        { name: 'Pengumuman', path: '/dashboard/pengumuman', icon: Megaphone, show: true },
        { name: 'Pemberitahuan', path: '/dashboard/notifikasi', icon: Bell, show: true },
        { name: 'Profil Saya', path: '/dashboard/profil', icon: UserCog, show: true },
      ]
    },
    {
      title: 'Warga',
      items: [
        { name: 'Bayar Iuran', path: '/dashboard/tagihan', icon: Receipt, show: hasRole('warga') }
      ]
    },
    {
      title: 'Laporan Keuangan',
      items: [
        { name: 'Catatan Kas', path: '/dashboard/admin/kas', icon: History, show: hasRole(['rt', 'wakil_rt', 'bendahara']) },
        { name: 'Laporan Resmi', path: hasRole(['warga']) ? '/dashboard/laporan' : '/dashboard/admin/laporan', icon: FileText, show: hasRole(['warga', 'rt', 'wakil_rt', 'bendahara']) },
      ]
    },
    {
      title: 'Kelola RT',
      items: [
        { name: 'Daftar Warga', path: '/dashboard/admin/warga', icon: Users, show: hasRole(['rt', 'wakil_rt', 'sekretaris', 'bendahara']) },
        { name: 'Jenis Iuran', path: '/dashboard/admin/iuran', icon: WalletCards, show: hasRole(['rt', 'wakil_rt', 'bendahara']) },
        { name: 'Tagihan Warga', path: '/dashboard/admin/tagihan', icon: Receipt, show: hasRole(['rt', 'wakil_rt', 'bendahara']) }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 
        transition-transform duration-300 ease-in-out flex flex-col shadow-xl shadow-slate-200/50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 mb-2">
          <Link href="/dashboard" className="block">
            <img src="/logo.png" alt="WargaKlik Logo" className="h-20 w-auto" />
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
          {menuGroups.map((group, idx) => {
            const visibleItems = group.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="mb-8">
                <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  {group.title}
                </h3>
                <div className="space-y-1.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path, item.exact);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`
                          flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all duration-200
                          ${active
                            ? 'bg-emerald-50 text-primary font-bold shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-slate-400 group-hover:text-primary transition-colors'}`} />
                          <span className="text-sm tracking-tight">{item.name}</span>
                        </div>
                        {active && <ChevronRight className="w-4 h-4 text-primary" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-4 mb-6 px-1">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
              <UserIcon className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-bold bg-white border border-slate-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all text-sm"
          >
            <LogOut className="w-5 h-5" />
            Keluar Akun
          </button>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <Heart className="w-3 h-3 fill-slate-300" />
              Untuk Warga RT
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
