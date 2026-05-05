'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { 
  Receipt, 
  Search, 
  Filter, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { formatRupiah, getBulanName } from '@/utils/format';
import { toast } from 'react-hot-toast';

export default function TagihanList() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTagihan();
  }, [statusFilter]);

  const fetchTagihan = async () => {
    setLoading(true);
    try {
      let url = '/tagihan';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const res = await api.get(url);
      if (res.data.success) {
        setTagihan(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil data tagihan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'lunas':
        return <span className="badge badge-success"><CheckCircle2 className="w-3 h-3 mr-1"/> Lunas</span>;
      case 'belum_bayar':
        return <span className="badge badge-danger"><AlertCircle className="w-3 h-3 mr-1"/> Belum Bayar</span>;
      case 'sebagian':
        return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1"/> Sebagian</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            Tagihan Saya
          </h1>
          <p className="text-slate-400 text-sm mt-1">Kelola dan bayar iuran RT bulanan Anda</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-500" />
            </div>
            <select
              className="input-field pl-9 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="belum_bayar">Belum Bayar</option>
              <option value="sebagian">Bayar Sebagian</option>
              <option value="lunas">Lunas</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : tagihan.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {tagihan.map((item) => (
            <Link 
              href={`/dashboard/tagihan/${item.id}`} 
              key={item.id}
              className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border flex-shrink-0 ${
                  item.status === 'lunas' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  item.status === 'belum_bayar' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <Receipt className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    Iuran Bulan {getBulanName(item.bulan)} {item.tahun}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400">
                    <span className="font-medium text-slate-300">{formatRupiah(item.total_nominal)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span>Jatuh Tempo: {new Date(item.tahun, item.bulan - 1, 10).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-14 sm:pl-0">
                {getStatusBadge(item.status)}
                
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Tidak ada tagihan</h3>
          <p className="text-slate-400">Anda tidak memiliki tagihan dengan status tersebut.</p>
        </div>
      )}
    </div>
  );
}
