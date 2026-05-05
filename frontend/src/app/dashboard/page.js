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
  Activity
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
          // Fetch warga stats
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
          // Fetch admin stats
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
    return <div className="animate-pulse space-y-6">
      <div className="h-32 bg-slate-800/50 rounded-2xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
        <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
        <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
        <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
      </div>
      <div className="h-80 bg-slate-800/50 rounded-2xl"></div>
    </div>;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Inter' } }
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } }
    }
  };

  const chartData = {
    labels: data?.chartData?.map(d => d.month) || [],
    datasets: [
      {
        label: 'Pemasukan',
        data: data?.chartData?.map(d => d.masuk) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderRadius: 6,
      },
      {
        label: 'Pengeluaran',
        data: data?.chartData?.map(d => d.keluar) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderRadius: 6,
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Selamat Datang, {user?.name}! 👋
          </h1>
          <p className="text-slate-400">
            {hasRole('warga') 
              ? 'Pantau dan bayar iuran RT Anda dengan mudah.'
              : 'Kelola kas dan data warga RT dengan efisien.'}
          </p>
        </div>
      </div>

      {hasRole('warga') ? (
        // Warga Dashboard
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium">Tagihan Belum Lunas</h3>
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {formatRupiah(data?.totalTagihan || 0)}
              </div>
              <p className="text-sm text-slate-400">
                Dari {data?.menunggakCount || 0} tagihan
              </p>
            </div>
            
            <div className="glass-card p-6 border-l-4 border-l-amber-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 font-medium">Aksi Cepat</h3>
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                {data?.menunggakCount > 0 ? (
                  <p className="text-sm text-slate-300">Anda memiliki tagihan yang perlu dibayar.</p>
                ) : (
                  <p className="text-sm text-slate-300">Tidak ada tagihan tertunggak saat ini.</p>
                )}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/tagihan" className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium transition-colors">
                  Lihat Tagihan <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-400" />
              Pengumuman Terbaru
            </h2>
            <div className="space-y-4">
              {data?.pengumuman?.length > 0 ? (
                data.pengumuman.map((p) => (
                  <div key={p.id} className="glass-card p-5 hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{p.title}</h3>
                      <span className="text-xs text-slate-500">
                        {new Date(p.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{p.content}</p>
                  </div>
                ))
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-slate-400">Belum ada pengumuman.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Admin Dashboard
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 border-b-4 border-b-emerald-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium">Total Kas</h3>
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatRupiah(data?.saldoKas || 0)}
              </div>
            </div>

            <div className="glass-card p-6 border-b-4 border-b-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium">Kas Masuk</h3>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatRupiah(data?.kasMasuk || 0)}
              </div>
            </div>

            <div className="glass-card p-6 border-b-4 border-b-red-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium">Kas Keluar</h3>
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatRupiah(data?.kasKeluar || 0)}
              </div>
            </div>

            <div className="glass-card p-6 border-b-4 border-b-amber-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium">Warga Aktif</h3>
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {data?.totalWarga || 0}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Tren Keuangan (6 Bulan Terakhir)
                </h3>
              </div>
              <div className="h-80 w-full">
                <Bar options={chartOptions} data={chartData} />
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Status Penagihan
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <p className="text-sm text-slate-400 mb-1">Tagihan Menunggak</p>
                    <p className="text-2xl font-bold text-amber-400">{data?.totalMenunggak || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Tagihan belum lunas dari semua periode</p>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Pastikan untuk memantau pembayaran warga secara rutin dan mengirimkan pengingat jika diperlukan.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/dashboard/admin/tagihan" className="btn-primary w-full inline-flex items-center justify-center">
                  Kelola Penagihan <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

