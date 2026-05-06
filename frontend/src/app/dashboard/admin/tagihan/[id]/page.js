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
    <>
      <div className="space-y-6 md:space-y-10 animate-fade-in relative pb-20 font-sans max-w-6xl mx-auto px-4 sm:px-0">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6 md:pb-8">
        <div className="space-y-4 w-full md:w-auto">
          <Link href="/dashboard/admin/tagihan" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-black text-xs uppercase tracking-widest group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Detail Tagihan <span className="text-primary">{warga?.kepala_keluarga}</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">Kelola status pembayaran warga secara manual.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
          <button
            onClick={handleGenerateFuture}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-white border-2 border-slate-100 px-6 py-4 rounded-xl md:rounded-[1.5rem] font-bold text-slate-600 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Bulan Depan
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => openBayarModal(null)}
              className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl md:rounded-[1.5rem] font-black text-base md:text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <HandCoins className="w-6 h-6" />
              Bayar ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Resident Info Card - Optimized for Mobile */}
      <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 md:gap-8">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-white/10 border-4 border-white/5 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center text-primary shadow-2xl shrink-0">
              <User className="w-10 h-10 md:w-14 md:h-14" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight mb-3">{warga?.kepala_keluarga}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 md:gap-3">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Home className="w-3.5 h-3.5 text-primary" /> BLOK {warga?.no_rumah}
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> #{warga?.id}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col justify-center items-center text-center group hover:bg-white/10 transition-colors">
              <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">Tunggakan</div>
              <div className="text-xl md:text-3xl font-black text-red-400 tracking-tighter">{formatRupiah(totalTunggakan)}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col justify-center items-center text-center group hover:bg-white/10 transition-colors">
              <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">Kolektabilitas</div>
              <div className={`text-lg md:text-2xl font-black tracking-tighter ${unpaidItems.length > 0 ? 'text-amber-400' : 'text-primary'}`}>
                {unpaidItems.length > 0 ? `${unpaidItems.length} Bulan` : 'Lancar'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Section */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center">
              <History className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">Catatan Tagihan</h3>
          </div>

          <button
            onClick={handleSelectAll}
            className="w-full sm:w-auto text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.2em] px-6 py-3 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-all border border-emerald-100"
          >
            {selectedIds.length === unpaidItems.length ? 'Batalkan Semua' : 'Pilih Semua Tunggakan'}
          </button>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-8 w-20">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 bg-white border-2 border-slate-200 rounded-lg"></div>
                  </div>
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Periode</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Besaran Iuran</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status Pembayaran</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tagihan.length > 0 ? (
                tagihan.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => item.status !== 'lunas' && toggleSelect(item.id)}
                    className={`group transition-all cursor-pointer ${selectedIds.includes(item.id) ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="p-8 text-center">
                      <div className="flex items-center justify-center">
                        {item.status !== 'lunas' ? (
                          <div className={`w-7 h-7 rounded-xl transition-all flex items-center justify-center border-2 ${selectedIds.includes(item.id) ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-200 group-hover:border-primary/50'}`}>
                            {selectedIds.includes(item.id) && <CheckCircle2 className="w-5 h-5 text-white" />}
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/50">
                            <CheckCircle2 className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{getBulanName(item.bulan)} {item.tahun}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">KODE: TGH-{item.id}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="text-xl font-black text-primary tracking-tight">{formatRupiah(item.total_nominal)}</div>
                    </td>
                    <td className="p-8 text-center">
                      {item.status === 'lunas' ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-primary px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-emerald-100 shadow-sm">Lunas</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-danger px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-red-100 shadow-sm">Belum Bayar</span>
                      )}
                    </td>
                    <td className="p-8 text-right">
                      {item.status !== 'lunas' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openBayarModal(item); }}
                          className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-primary hover:-translate-y-1 transition-all"
                        >
                          <Wallet className="w-6 h-6" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Receipt className="w-16 h-16 text-slate-100" />
                      <div className="text-xl font-bold text-slate-300 tracking-tight">Belum ada catatan tagihan untuk warga ini.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="md:hidden divide-y divide-slate-50">
          {tagihan.length > 0 ? (
            tagihan.map((item) => (
              <div
                key={item.id}
                onClick={() => item.status !== 'lunas' && toggleSelect(item.id)}
                className={`p-6 space-y-4 transition-all ${selectedIds.includes(item.id) ? 'bg-emerald-50/50' : 'active:bg-slate-50'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {item.status !== 'lunas' ? (
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(item.id) ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}>
                        {selectedIds.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-slate-900 tracking-tight">{getBulanName(item.bulan)} {item.tahun}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TGH-{item.id}</span>
                    </div>
                  </div>
                  {item.status === 'lunas' ? (
                    <span className="bg-emerald-50 text-primary px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">Lunas</span>
                  ) : (
                    <span className="bg-red-50 text-danger px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-100">Belum Bayar</span>
                  )}
                </div>

                <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xl font-black text-primary tracking-tight">{formatRupiah(item.total_nominal)}</div>
                  {item.status !== 'lunas' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openBayarModal(item); }}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" /> Bayar
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center text-slate-300 font-bold">Belum ada tagihan.</div>
          )}
        </div>
      </div>
      </div>
      
      {/* Manual Payment Terminal (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] w-full max-w-xl p-8 md:p-14 shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="flex justify-between items-center mb-8 md:mb-10 pb-4 md:pb-6 border-b border-slate-100">
              <h3 className="font-bold text-xl md:text-3xl text-slate-900 tracking-tight flex items-center gap-3 md:gap-4">
                <HandCoins className="w-7 h-7 md:w-9 md:h-9 text-primary" /> Validasi Bayar
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitPembayaran} className="space-y-6 md:space-y-8">
              <div className="bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 space-y-4 md:space-y-6">
                <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">Rincian Pembayaran</div>
                <div className="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar font-bold text-slate-600 text-sm md:text-base">
                  {selectedTagihan.map(t => (
                    <div key={t.id} className="flex justify-between items-center">
                      <span>{getBulanName(t.bulan)} {t.tahun}</span>
                      <span className="text-slate-900">{formatRupiah(t.total_nominal)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t-2 border-dashed border-slate-200 flex justify-between items-end">
                  <span className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest">Total Bayar</span>
                  <span className="text-2xl md:text-4xl text-primary font-black tracking-tighter">
                    {formatRupiah(selectedTagihan.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-bold text-slate-700 ml-1">Catatan Validasi (Opsional)</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 p-4 md:p-5 text-base md:text-lg font-bold text-slate-900 outline-none focus:border-primary rounded-xl md:rounded-2xl h-24 md:h-32 resize-none"
                    placeholder="Contoh: Pembayaran tunai diterima..."
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:flex-1 py-4 md:py-5 bg-slate-100 text-slate-700 font-bold rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm md:text-base"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-[2] bg-primary text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 md:w-7 md:h-7 animate-spin" /> : <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" />}
                    Konfirmasi Bayar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
