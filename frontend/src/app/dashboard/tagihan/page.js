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
  Clock,
  HandCoins,
  Loader2,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { formatRupiah, getBulanName } from '@/utils/format';
import { toast } from 'react-hot-toast';

export default function TagihanList() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isPaying, setIsPaying] = useState(false);

  const [isGeneratingFuture, setIsGeneratingFuture] = useState(false);

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

  const handleGenerateFuture = async () => {
    setIsGeneratingFuture(true);
    try {
      const res = await api.post('/tagihan/generate-future', { count: 1 });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchTagihan();
      }
    } catch (err) {
      toast.error('Gagal membuat tagihan bulan depan');
    } finally {
      setIsGeneratingFuture(false);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkPay = async () => {
    if (selectedIds.length === 0) return;
    setIsPaying(true);
    try {
      const res = await api.post('/pembayaran/midtrans/snap', { 
        tagihan_ids: selectedIds 
      });
      
      if (res.data.success && res.data.data.token) {
        window.snap.pay(res.data.data.token, {
          onSuccess: (result) => {
            toast.success('Pembayaran berhasil!');
            fetchTagihan();
            setSelectedIds([]);
          },
          onPending: (result) => {
            toast('Menunggu pembayaran...', { icon: '⏳' });
            fetchTagihan();
            setSelectedIds([]);
          },
          onError: (result) => {
            toast.error('Pembayaran gagal');
          },
          onClose: () => {
            toast('Menunggu pembayaran diselesaikan', { icon: 'ℹ️' });
          }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memulai pembayaran');
    } finally {
      setIsPaying(false);
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

  const totalSelected = tagihan
    .filter(t => selectedIds.includes(t.id))
    .reduce((sum, t) => sum + parseFloat(t.total_nominal), 0);

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

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={handleGenerateFuture}
            disabled={isGeneratingFuture}
            className="btn-secondary flex items-center gap-2 py-2 text-sm order-2 sm:order-1"
          >
            {isGeneratingFuture ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Bayar Bulan Depan
          </button>
          
          <div className="relative w-full sm:w-48 order-1 sm:order-2">
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

      {selectedIds.length > 0 && (
        <div className="glass-card p-4 border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-10 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-medium">{selectedIds.length} Tagihan Terpilih</p>
              <p className="text-slate-400 text-sm">Total: <span className="text-emerald-400 font-bold">{formatRupiah(totalSelected)}</span></p>
            </div>
          </div>
          <button 
            onClick={handleBulkPay}
            disabled={isPaying}
            className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
          >
            {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : <HandCoins className="w-5 h-5" />}
            Bayar Sekaligus (Rapel)
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : tagihan.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {tagihan.map((item) => (
            <div 
              key={item.id}
              className={`glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all ${
                selectedIds.includes(item.id) ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-4">
                {item.status !== 'lunas' && (
                  <div className="pt-3">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </div>
                )}
                
                <div className={`p-3 rounded-xl border flex-shrink-0 ${
                  item.status === 'lunas' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  item.status === 'belum_bayar' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <Receipt className="w-6 h-6" />
                </div>
                
                <div onClick={() => item.status !== 'lunas' && toggleSelect(item.id)} className="cursor-pointer">
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
                
                <Link href={`/dashboard/tagihan/${item.id}`} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
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
