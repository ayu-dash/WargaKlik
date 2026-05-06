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
  Calendar,
  Check
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
    switch (status) {
      case 'lunas':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-100"><CheckCircle2 className="w-3 md:w-3.5 h-3 md:h-3.5" /> Lunas</span>;
      case 'belum_bayar':
        return <span className="inline-flex items-center gap-1 bg-red-50 text-danger px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-red-100"><AlertCircle className="w-3 md:w-3.5 h-3 md:h-3.5" /> Belum Bayar</span>;
      case 'sebagian':
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-amber-100"><Clock className="w-3 md:w-3.5 h-3 md:h-3.5" /> Sebagian</span>;
      default:
        return <span className="bg-slate-100 text-slate-500 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  const totalSelected = tagihan
    .filter(t => selectedIds.includes(t.id))
    .reduce((sum, t) => {
      const paidAmount = t.pembayaran?.reduce((pSum, p) => pSum + parseFloat(p.jumlah_bayar), 0) || 0;
      return sum + (parseFloat(t.total_nominal) - paidAmount);
    }, 0);

  const handleSelectAll = () => {
    const unpaidIds = tagihan.filter(t => t.status !== 'lunas').map(t => t.id);
    if (selectedIds.length === unpaidIds.length && unpaidIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unpaidIds);
    }
  };

  return (
    <>
      <div className="space-y-6 md:space-y-10 animate-fade-in relative pb-48 font-sans max-w-5xl mx-auto px-4 sm:px-0">
        <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 border-b border-slate-200 pb-6 md:pb-10">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
              Tagihan <span className="text-primary">Warga</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-lg font-medium">Bayar iuran bulanan dengan mudah and cepat.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
            <button
              onClick={handleGenerateFuture}
              disabled={isGeneratingFuture}
              className="w-full sm:w-auto bg-white border-2 border-slate-100 px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-[1.2rem] font-bold text-slate-600 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2 shadow-sm text-sm md:text-base"
            >
              {isGeneratingFuture ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
              Bayar Bulan Depan
            </button>

            <div className="relative w-full sm:w-56">
              <div className="absolute inset-y-0 left-4 md:left-5 flex items-center pointer-events-none">
                <Filter className="h-4 md:h-5 w-4 md:w-5 text-slate-400" />
              </div>
              <select
                className="w-full bg-white border border-slate-200 py-3 md:py-4 pl-11 md:pl-12 pr-6 text-slate-900 font-bold focus:border-primary transition-all rounded-xl md:rounded-[1.2rem] outline-none shadow-sm appearance-none text-sm md:text-base"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Tagihan</option>
                <option value="belum_bayar">Belum Lunas</option>
                <option value="sebagian">Terbayar Sebagian</option>
                <option value="lunas">Sudah Lunas</option>
              </select>
            </div>

            {tagihan.filter(t => t.status !== 'lunas').length > 0 && (
              <button
                onClick={handleSelectAll}
                className="w-full sm:w-auto bg-emerald-50 text-primary border border-emerald-100 px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-[1.2rem] font-black text-sm md:text-base hover:bg-emerald-100 transition-all shadow-sm whitespace-nowrap"
              >
                {selectedIds.length === tagihan.filter(t => t.status !== 'lunas').length ? 'Batalkan Semua' : 'Pilih Semua'}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="h-64 md:h-80 flex flex-col items-center justify-center bg-white rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-sm">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-primary animate-spin mb-4" />
            <div className="text-slate-500 font-bold text-sm md:text-base">Mengambil data tagihan...</div>
          </div>
        ) : tagihan.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {tagihan.map((item) => {
              const paidAmount = item.pembayaran?.reduce((sum, p) => sum + parseFloat(p.jumlah_bayar), 0) || 0;
              const remaining = parseFloat(item.total_nominal) - paidAmount;
              
              return (
                <div
                  key={item.id}
                  onClick={() => item.status !== 'lunas' && toggleSelect(item.id)}
                  className={`bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 group transition-all cursor-pointer ${selectedIds.includes(item.id) ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-slate-100 hover:border-primary/20 hover:shadow-lg'
                    }`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    {item.status !== 'lunas' && (
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={selectedIds.includes(item.id)}
                          readOnly
                        />
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-100 rounded-md md:rounded-lg peer-checked:bg-primary transition-all flex items-center justify-center">
                          <Check className={`w-4 h-4 md:w-5 md:h-5 text-white transition-all ${selectedIds.includes(item.id) ? 'scale-100' : 'scale-0'}`} />
                        </div>
                      </div>
                    )}

                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.2rem] flex items-center justify-center shadow-md transition-transform group-hover:scale-110 shrink-0 ${item.status === 'lunas' ? 'bg-emerald-50 text-primary' :
                      item.status === 'belum_bayar' ? 'bg-red-50 text-danger' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                      <Receipt className="w-6 h-6 md:w-8 md:h-8" />
                    </div>

                    <div className="space-y-0.5 md:space-y-1">
                      <h3 className="font-black text-slate-900 text-lg md:text-2xl tracking-tight leading-tight">
                        Iuran {getBulanName(item.bulan)} {item.tahun}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <div className="flex flex-col">
                          <span className="font-black text-primary text-base md:text-lg">{formatRupiah(remaining)}</span>
                          {item.status === 'sebagian' && (
                            <span className="text-[10px] font-bold text-slate-400">Total: {formatRupiah(item.total_nominal)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-400">
                          <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span className="hidden xs:inline">Jatuh Tempo:</span> 10 {getBulanName(item.bulan)} {item.tahun}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                    {getStatusBadge(item.status)}

                    <Link href={`/dashboard/tagihan/${item.id}`} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-inner group/btn">
                      <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 p-12 md:p-20 text-center rounded-3xl md:rounded-[3rem] flex flex-col items-center">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-slate-300" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Semua Aman!</h3>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-sm">Anda tidak memiliki tagihan yang perlu dibayar saat ini. Terima kasih atas partisipasi Anda!</p>
          </div>
        )}
      </div>

      {/* Floating Action Bar for Payment */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 lg:ml-32 z-50 w-[92%] max-w-2xl animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 text-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-[1.2rem] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 md:mb-1">{selectedIds.length} Tagihan Terpilih</div>
                <div className="text-xl md:text-3xl font-black text-white leading-none">{formatRupiah(totalSelected)}</div>
              </div>
            </div>
            <button
              onClick={handleBulkPay}
              disabled={isPaying}
              className="w-full md:w-auto bg-primary text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-base md:text-xl shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-2 md:gap-3"
            >
              {isPaying ? <Loader2 className="w-6 h-6 md:w-7 md:h-7 animate-spin" /> : <HandCoins className="w-6 h-6 md:w-7 md:h-7" />}
              Bayar Sekarang
            </button>
          </div>
        </div>
      )}
    </>
  );
}
