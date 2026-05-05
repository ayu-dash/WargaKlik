'use client';

import { useState, useEffect, use } from 'react';
import api from '@/utils/api';
import { 
  Receipt, 
  ArrowLeft, 
  User, 
  HandCoins, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Clock,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  History,
  Calendar,
  Wallet,
  Home,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatRupiah, getBulanName } from '@/utils/format';
import Link from 'next/link';

export default function DetailTagihanWarga({ params }) {
  const unwrappedParams = use(params);
  const wargaId = unwrappedParams.id;
  
  const [tagihan, setTagihan] = useState([]);
  const [warga, setWarga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal Bayar Manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState([]);
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [wargaId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tagihan?warga_id=${wargaId}`);
      setTagihan(res.data.data);
      if (res.data.data.length > 0) {
        setWarga(res.data.data[0].warga);
      } else {
        const wargaRes = await api.get(`/warga/${wargaId}`);
        setWarga(wargaRes.data.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil data tagihan');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const unpaidIds = tagihan.filter(t => t.status !== 'lunas').map(t => t.id);
    if (selectedIds.length === unpaidIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unpaidIds);
    }
  };

  const openBayarModal = (item) => {
    if (item) {
      setSelectedTagihan([item]);
      setJumlahBayar(item.total_nominal);
    } else {
      const selected = tagihan.filter(t => selectedIds.includes(t.id));
      setSelectedTagihan(selected);
      const total = selected.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0);
      setJumlahBayar(total);
    }
    setCatatan('');
    setIsModalOpen(true);
  };

  const handleGenerateFuture = async () => {
    try {
      setIsGenerating(true);
      await api.post('/tagihan/generate-future', { warga_id: wargaId, count: 1 });
      toast.success('Tagihan bulan depan berhasil dibuat');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat tagihan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitPembayaran = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const ids = selectedTagihan.map(t => t.id);
      await api.post('/pembayaran/manual', {
        tagihan_ids: ids,
        jumlah_bayar: jumlahBayar,
        catatan
      });
      
      toast.success('Pembayaran berhasil dicatat');
      setIsModalOpen(false);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat pembayaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !warga) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <div className="text-slate-500 font-bold">Mengakses data tagihan...</div>
      </div>
    );
  }

  const unpaidItems = tagihan.filter(t => t.status !== 'lunas');
  const totalTunggakan = unpaidItems.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0);

  return (
    <div className="space-y-10 animate-fade-in relative pb-20 font-sans max-w-6xl mx-auto">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <Link href="/dashboard/admin/tagihan" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-all font-bold group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar Tagihan
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Detail Tagihan <span className="text-primary">{warga?.kepala_keluarga}</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium">Kelola status pembayaran warga secara manual.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <button 
            onClick={handleGenerateFuture}
            disabled={isGenerating}
            className="flex-1 md:flex-none bg-white border-2 border-slate-100 px-6 py-4 rounded-[1.2rem] font-bold text-slate-600 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Tambah Tagihan Depan
          </button>
          
          {selectedIds.length > 0 && (
            <button 
              onClick={() => openBayarModal(null)} 
              className="flex-1 md:flex-none bg-primary text-white px-8 py-4 rounded-[1.2rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-3"
            >
              <HandCoins className="w-6 h-6" />
              Bayar Terpilih ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Resident Info Card */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl shadow-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex items-center gap-8">
            <div className="w-24 h-24 bg-white/10 border-4 border-white/5 rounded-[2rem] flex items-center justify-center text-primary shadow-xl">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight leading-tight mb-2">{warga?.kepala_keluarga}</h2>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Home className="w-3.5 h-3.5 text-primary" /> BLOK {warga?.no_rumah}
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-primary" /> UID: #{warga?.id}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col justify-center items-center text-center">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tunggakan</div>
               <div className="text-2xl font-black text-red-400">{formatRupiah(totalTunggakan)}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col justify-center items-center text-center">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
               <div className={`text-xl font-black ${unpaidItems.length > 0 ? 'text-amber-400' : 'text-primary'}`}>
                 {unpaidItems.length > 0 ? `${unpaidItems.length} Blm Lunas` : 'Lunas'}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Catatan Tagihan</h3>
          </div>
          
          <button 
            onClick={handleSelectAll}
            className="text-xs font-black text-primary uppercase tracking-widest px-4 py-2 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-all border border-emerald-100"
          >
            {selectedIds.length === unpaidItems.length ? 'Batal Pilih Semua' : 'Pilih Semua Tunggakan'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-6 w-12">
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 bg-white border-2 border-slate-200 rounded-md"></div>
                  </div>
                </th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Periode</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Besaran</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tagihan.length > 0 ? (
                tagihan.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => item.status !== 'lunas' && toggleSelect(item.id)}
                    className={`group transition-all cursor-pointer ${selectedIds.includes(item.id) ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-6">
                      <div className="flex items-center justify-center">
                        {item.status !== 'lunas' ? (
                          <div className={`w-6 h-6 rounded-lg transition-all flex items-center justify-center border-2 ${selectedIds.includes(item.id) ? 'bg-primary border-primary' : 'bg-white border-slate-200 group-hover:border-primary/50'}`}>
                             {selectedIds.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                             <CheckCircle2 className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-slate-900 tracking-tight">{getBulanName(item.bulan)} {item.tahun}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: #{item.id}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-lg font-black text-primary">{formatRupiah(item.total_nominal)}</div>
                    </td>
                    <td className="p-6 text-center">
                      {item.status === 'lunas' ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Lunas</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-danger px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">Belum Bayar</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {item.status !== 'lunas' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); openBayarModal(item); }}
                          className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.1] active:scale-[0.9] transition-all"
                        >
                          <Wallet className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 font-bold">
                    Warga ini tidak memiliki catatan tagihan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Terminal (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 md:p-14 shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
              <h3 className="font-bold text-3xl text-slate-900 tracking-tight flex items-center gap-4">
                <HandCoins className="w-8 h-8 text-primary" /> Validasi Bayar
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitPembayaran} className="space-y-8">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Rangkuman Pembayaran</div>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar font-bold text-slate-600">
                  {selectedTagihan.map(t => (
                    <div key={t.id} className="flex justify-between items-center">
                      <span className="text-sm">{getBulanName(t.bulan)} {t.tahun}</span>
                      <span className="text-slate-900">{formatRupiah(t.total_nominal)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t-2 border-dashed border-slate-200 flex justify-between items-end">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Bayar</span>
                  <span className="text-3xl text-primary font-black tracking-tight">
                    {formatRupiah(selectedTagihan.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Catatan Tambahan (Opsional)</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 p-5 text-lg font-bold text-slate-900 outline-none focus:border-primary rounded-2xl h-24" 
                    placeholder="Contoh: Bayar lunas titipan Pak RT..." 
                    value={catatan} 
                    onChange={e => setCatatan(e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="py-5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all text-lg"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-primary text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                    Konfirmasi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
