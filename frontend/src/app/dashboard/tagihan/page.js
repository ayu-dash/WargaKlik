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
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar
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
        return <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5"/> Lunas</span>;
      case 'belum_bayar':
        return <span className="inline-flex items-center gap-1.5 bg-red-50 text-danger px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100"><AlertCircle className="w-3.5 h-3.5"/> Belum Bayar</span>;
      case 'sebagian':
        return <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100"><Clock className="w-3.5 h-3.5"/> Sebagian</span>;
      default:
        return <span className="bg-slate-100 text-slate-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  const totalSelected = tagihan
    .filter(t => selectedIds.includes(t.id))
    .reduce((sum, t) => sum + parseFloat(t.total_nominal), 0);

  return (
    <div className="space-y-10 animate-fade-in relative pb-20 font-sans max-w-5xl mx-auto">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-slate-200 pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Tagihan <span className="text-primary">Warga</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Bayar iuran bulanan dengan mudah dan cepat.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <button 
            onClick={handleGenerateFuture}
            disabled={isGeneratingFuture}
            className="flex-1 md:flex-none bg-white border-2 border-slate-100 px-6 py-4 rounded-[1.2rem] font-bold text-slate-600 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isGeneratingFuture ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Bayar Bulan Depan
          </button>
          
          <div className="relative flex-1 md:w-56">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-slate-400" />
            </div>
            <select
              className="w-full bg-white border border-slate-200 py-4 pl-12 pr-6 text-slate-900 font-bold focus:border-primary transition-all rounded-[1.2rem] outline-none shadow-sm appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Tagihan</option>
              <option value="belum_bayar">Belum Lunas</option>
              <option value="sebagian">Terbayar Sebagian</option>
              <option value="lunas">Sudah Lunas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Payment */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 rounded-[1.2rem] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{selectedIds.length} Tagihan Terpilih</div>
                  <div className="text-3xl font-black text-white leading-none">{formatRupiah(totalSelected)}</div>
                </div>
              </div>
              <button 
                onClick={handleBulkPay}
                disabled={isPaying}
                className="w-full md:w-auto bg-primary text-white px-10 py-5 rounded-[1.5rem] font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-3"
              >
                {isPaying ? <Loader2 className="w-7 h-7 animate-spin" /> : <HandCoins className="w-7 h-7" />}
                Bayar Sekarang
              </button>
           </div>
        </div>
      )}

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <div className="text-slate-500 font-bold">Mengambil data tagihan...</div>
        </div>
      ) : tagihan.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {tagihan.map((item) => (
            <div 
              key={item.id}
              onClick={() => item.status !== 'lunas' && toggleSelect(item.id)}
              className={`bg-white p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row md:items-center justify-between gap-8 group transition-all cursor-pointer ${
                selectedIds.includes(item.id) ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-slate-100 hover:border-primary/20 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-6">
                {item.status !== 'lunas' && (
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={selectedIds.includes(item.id)}
                      readOnly
                    />
                    <div className="w-8 h-8 bg-slate-100 rounded-lg peer-checked:bg-primary transition-all flex items-center justify-center">
                       <Check className={`w-5 h-5 text-white transition-all ${selectedIds.includes(item.id) ? 'scale-100' : 'scale-0'}`} />
                    </div>
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
                  item.status === 'lunas' ? 'bg-emerald-50 text-primary' :
                  item.status === 'belum_bayar' ? 'bg-red-50 text-danger' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  <Receipt className="w-8 h-8" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight leading-tight">
                    Iuran {getBulanName(item.bulan)} {item.tahun}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-black text-primary text-lg">{formatRupiah(item.total_nominal)}</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                       <Calendar className="w-3.5 h-3.5" />
                       Jatuh Tempo: 10 {getBulanName(item.bulan)} {item.tahun}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                {getStatusBadge(item.status)}
                
                <Link href={`/dashboard/tagihan/${item.id}`} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-inner group/btn">
                  <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-200 p-20 text-center rounded-[3rem] flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Semua Aman!</h3>
          <p className="text-slate-500 font-medium max-w-sm">Anda tidak memiliki tagihan yang perlu dibayar saat ini. Terima kasih atas partisipasi Anda!</p>
        </div>
      )}
    </div>
  );
}
