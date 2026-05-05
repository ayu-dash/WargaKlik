'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Users,
  Receipt,
  ArrowRight,
  Megaphone,
  Activity,
  Heart,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { formatRupiah } from '@/utils/format';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardHome() {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (hasRole('warga')) {
          const [tagihanRes, pengumumanRes] = await Promise.all([
            api.get('/tagihan?status=belum_bayar,sebagian'),
            api.get('/pengumuman?limit=3')
          ]);
          
          let totalTagihan = 0;
          let menunggakCount = 0;
          
          if (tagihanRes.data.success) {
            tagihanRes.data.data.forEach(t => {
              totalTagihan += parseFloat(t.total_nominal);
              menunggakCount++;
            });
          }

          setData({
            totalTagihan,
            menunggakCount,
            pengumuman: pengumumanRes.data.success ? pengumumanRes.data.data : []
          });
        } else {
          const [kasRes, wargaRes, tagihanRes, statsRes] = await Promise.all([
            api.get('/kas?limit=1'),
            api.get('/warga?status=aktif'),
            api.get('/tagihan?status=belum_bayar'),
            api.get('/kas/stats')
          ]);

          setData({
            saldoKas: kasRes.data.success ? kasRes.data.pagination.summary.saldo : 0,
            kasMasuk: kasRes.data.success ? kasRes.data.pagination.summary.masuk : 0,
            kasKeluar: kasRes.data.success ? kasRes.data.pagination.summary.keluar : 0,
            totalWarga: wargaRes.data.success ? wargaRes.data.pagination.total : 0,
            totalMenunggak: tagihanRes.data.success ? tagihanRes.data.pagination.total : 0,
            chartData: statsRes.data.success ? statsRes.data.data : []
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [hasRole]);

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-48 bg-slate-200 rounded-[2.5rem] w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="h-40 bg-slate-200 rounded-[2rem]"></div>
        <div className="h-40 bg-slate-200 rounded-[2rem]"></div>
        <div className="h-40 bg-slate-200 rounded-[2rem]"></div>
        <div className="h-40 bg-slate-200 rounded-[2rem]"></div>
      </div>
      <div className="h-96 bg-slate-200 rounded-[2.5rem]"></div>
    </div>;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#475569', font: { family: 'Plus Jakarta Sans', weight: '700', size: 12 } }
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: '600' } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { weight: '600' } } }
    }
  };

  const chartData = {
    labels: data?.chartData?.map(d => d.month) || [],
    datasets: [
      {
        label: 'Pemasukan',
        data: data?.chartData?.map(d => d.masuk) || [],
        backgroundColor: '#10b981',
        borderRadius: 12,
        barThickness: 20,
      },
      {
        label: 'Pengeluaran',
        data: data?.chartData?.map(d => d.keluar) || [],
        backgroundColor: '#ef4444',
        borderRadius: 12,
        barThickness: 20,
      }
    ]
  };

  return (
    <div className="space-y-10 animate-fade-in relative pb-10">
      {/* Welcome Section */}
      <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-sm font-bold text-primary uppercase tracking-widest">
            <Heart className="w-4 h-4 fill-primary" />
            Portal Lingkungan Kita
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Selamat Datang, <br />
            <span className="text-primary">{user?.name}!</span> 👋
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-md leading-relaxed">
            {hasRole('warga') 
              ? 'Terima kasih telah berkontribusi untuk pembangunan lingkungan kita bersama.'
              : 'Pantau laporan keuangan dan kelola data warga dengan jujur dan transparan.'}
          </p>
        </div>
        <div className="relative z-10 hidden lg:block">
           <div className="w-48 h-48 bg-slate-50 rounded-full border-8 border-white shadow-2xl flex items-center justify-center">
              <Users className="w-20 h-20 text-slate-200" />
           </div>
        </div>
      </div>

      {hasRole('warga') ? (
        // Warga Dashboard - Friendly Layout
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                   <Receipt className="w-7 h-7 text-primary" />
                   Tagihan Anda
                </h2>
                <Link href="/dashboard/tagihan" className="text-sm font-bold text-primary flex items-center gap-1 group">
                   Lihat Detail <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Belum Dibayar</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">
                    {formatRupiah(data?.totalTagihan || 0)}
                  </div>
                </div>
                <div className="w-px h-16 bg-slate-100 hidden md:block" />
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Status Iuran</div>
                  <div className={`text-xl font-bold ${data?.menunggakCount > 0 ? 'text-danger' : 'text-primary'} flex items-center justify-center md:justify-start gap-2`}>
                    {data?.menunggakCount > 0 ? (
                       <><AlertCircle className="w-6 h-6" /> Ada {data?.menunggakCount} Tagihan</>
                    ) : (
                       <><CheckCircle2 className="w-6 h-6" /> Lunas / Aman</>
                    )}
                  </div>
                </div>
              </div>
              
              {data?.menunggakCount > 0 && (
                <Link 
                  href="/dashboard/tagihan" 
                  className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                >
                   Bayar Iuran Sekarang <ArrowRight className="w-6 h-6" />
                </Link>
              )}
            </div>
            
            <div className="space-y-6">
               <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 ml-2">
                  <Megaphone className="w-7 h-7 text-primary" />
                  Pengumuman Terbaru
               </h2>
               <div className="grid gap-4">
                  {data?.pengumuman?.length > 0 ? (
                    data.pengumuman.map((p) => (
                      <div key={p.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary/20 transition-all group">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{p.title}</h3>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                            {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                        <p className="text-slate-500 leading-relaxed font-medium line-clamp-2">{p.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-16 text-center rounded-[2.5rem] border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold text-lg">Belum ada pengumuman untuk saat ini.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-primary p-10 rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 space-y-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                   <Activity className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold leading-tight">Kontribusi Kita <br /> Membangun Desa</h3>
                <p className="text-emerald-50 text-sm font-medium leading-relaxed">
                   Setiap iuran yang Anda bayar digunakan untuk keamanan, kebersihan, dan kenyamanan lingkungan kita.
                </p>
                <div className="pt-4 border-t border-white/10">
                   <Link href="/dashboard/admin/kas" className="text-sm font-bold text-white flex items-center gap-2 hover:translate-x-2 transition-transform">
                      Lihat Laporan Kas RT <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>
          </div>
        </div>
      ) : (
        // Admin Dashboard - Clean Management View
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Total Kas RT', value: formatRupiah(data?.saldoKas || 0), color: 'text-primary', icon: Wallet, bg: 'bg-emerald-50' },
              { label: 'Pemasukan', value: formatRupiah(data?.kasMasuk || 0), color: 'text-blue-600', icon: TrendingUp, bg: 'bg-blue-50' },
              { label: 'Pengeluaran', value: formatRupiah(data?.kasKeluar || 0), color: 'text-danger', icon: TrendingDown, bg: 'bg-red-50' },
              { label: 'Warga Aktif', value: data?.totalWarga || 0, color: 'text-amber-600', icon: Users, bg: 'bg-amber-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 hover:shadow-lg transition-all group">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</div>
                  <div className={`text-2xl font-black text-slate-900 truncate`}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <Activity className="w-7 h-7 text-primary" />
                  Tren Keuangan Bulanan
                </h3>
                <Link href="/dashboard/admin/laporan" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Lihat Laporan Lengkap</Link>
              </div>
              <div className="h-96 w-full">
                <Bar options={chartOptions} data={chartData} />
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between space-y-8">
              <div className="space-y-8">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Status Penagihan</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">Ada {data?.totalMenunggak || 0} warga yang belum melunasi tagihan iuran bulan ini.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tunggakan</div>
                   <div className="text-3xl font-black text-danger">{data?.totalMenunggak || 0} Rumah</div>
                </div>
              </div>
              <Link 
                href="/dashboard/admin/tagihan" 
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg text-center hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
              >
                Kelola Tagihan <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
