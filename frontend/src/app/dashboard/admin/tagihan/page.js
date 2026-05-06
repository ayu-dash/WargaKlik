'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Receipt, Search, Check, AlertCircle, Clock, Loader2, HandCoins, X, Plus, User, ArrowRight, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatRupiah, getBulanName } from '@/utils/format';
import Link from 'next/link';

export default function AdminTagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('semua');

  // Modal Generate
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [wargaList, setWargaList] = useState([]);
  const [genData, setGenData] = useState({
    warga_id: '',
    bulan: (new Date().getMonth() + 1).toString(),
    tahun: new Date().getFullYear().toString()
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
    fetchWarga();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tagihan');
      setTagihan(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil data tagihan');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarga = async () => {
    try {
      const res = await api.get('/warga');
      setWargaList(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await api.post('/tagihan/generate', {
        ...genData,
        warga_id: genData.warga_id || null
      });
      toast.success('Tagihan berhasil dibuat');
      setIsGenerateModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate tagihan');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTagihan = tagihan.filter(t => {
    const matchesFilter = filter === 'semua' || t.status === filter;
    const matchesSearch =
      t.warga?.kepala_keluarga?.toLowerCase().includes(search.toLowerCase()) ||
      t.warga?.no_rumah?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedTagihan = filteredTagihan.reduce((acc, curr) => {
    const key = curr.warga_id;
    if (!acc[key]) {
      acc[key] = {
        warga: curr.warga,
        items: []
      };
    }
    acc[key].items.push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6 md:space-y-10 relative pb-10 font-sans max-w-7xl mx-auto px-4 sm:px-0">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6 md:pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Kelola <span className="text-primary">Tagihan Warga</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">
            Pantau dan validasi iuran warga dengan mudah dan transparan.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="w-full md:w-auto bg-primary text-white px-8 py-4 md:py-5 font-black rounded-xl md:rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-base md:text-lg"
        >
          <Plus className="w-6 h-6" />
          Buat Tagihan Baru
        </button>
      </div>

      {/* Stats Summary - Accessible Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-3 md:space-y-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-emerald-100">
            <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <div className="text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">Total Warga</div>
            <div className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{Object.keys(groupedTagihan).length} Rumah</div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-3 md:space-y-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-red-100">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-danger" />
          </div>
          <div>
            <div className="text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">Total Tunggakan</div>
            <div className="text-2xl md:text-4xl font-black text-danger tracking-tight">
              {formatRupiah(Object.values(groupedTagihan).reduce((acc, g) =>
                acc + g.items.filter(t => t.status !== 'lunas').reduce((s, t) => s + parseFloat(t.total_nominal), 0)
                , 0))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-3 md:space-y-4 sm:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-blue-100">
            <Check className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
          </div>
          <div>
            <div className="text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">Efisiensi Penagihan</div>
            <div className="text-2xl md:text-4xl font-black text-secondary tracking-tight">
              {Math.round((tagihan.filter(t => t.status === 'lunas').length / (tagihan.length || 1)) * 100)}% Lunas
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 md:gap-6 bg-white border border-slate-100 p-2 md:p-3 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/40">
        <div className="relative flex-grow w-full lg:max-w-xl">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-50 border-none py-4 md:py-5 pl-14 pr-6 text-slate-900 font-bold text-sm md:text-base focus:ring-2 focus:ring-primary/10 transition-all rounded-2xl md:rounded-[1.5rem] outline-none placeholder:text-slate-400"
            placeholder="Cari Nama atau Nomor Rumah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex p-1 bg-slate-50 rounded-2xl md:rounded-[1.5rem] gap-1 w-full lg:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'semua', label: 'Semua Status' },
            { id: 'belum_bayar', label: 'Belum Bayar' },
            { id: 'lunas', label: 'Sudah Lunas' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 lg:flex-none px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-[1.2rem] text-xs md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f.id ? 'bg-white text-primary shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="h-64 md:h-96 flex flex-col items-center justify-center bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <div className="text-slate-500 font-bold text-lg animate-pulse">Memuat data tagihan warga...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {Object.keys(groupedTagihan).length > 0 ? (
            Object.values(groupedTagihan).map((group) => {
              const unpaidItems = group.items.filter(t => t.status !== 'lunas');
              const totalUnpaid = unpaidItems.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0);

              return (
                <div key={group.warga.id} className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:scale-[1.02] transition-all group flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>

                  <div className="flex items-start gap-4 md:gap-5 mb-6 md:mb-8 border-b border-slate-50 pb-6 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-2xl shadow-xl">
                      {group.warga.no_rumah}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                        {group.warga.kepala_keluarga}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 md:mt-2">
                        <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${unpaidItems.length > 0 ? 'bg-danger animate-pulse' : 'bg-primary'}`} />
                        <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                          {unpaidItems.length > 0 ? `${unpaidItems.length} Bulan Belum Bayar` : 'Sudah Lunas'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 md:space-y-8 flex-grow mb-8 relative z-10">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Tunggakan</span>
                      <span className={`text-2xl md:text-4xl font-black tracking-tighter ${totalUnpaid > 0 ? 'text-slate-900' : 'text-primary'}`}>
                        {formatRupiah(totalUnpaid)}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] flex justify-between border border-slate-100">
                      <div className="text-center flex-1">
                        <div className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Catatan</div>
                        <div className="text-base md:text-xl font-black text-slate-700">{group.items.length} Data</div>
                      </div>
                      <div className="w-px bg-slate-200 mx-4" />
                      <div className="text-center flex-1">
                        <div className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</div>
                        <div className={`text-base md:text-xl font-black ${unpaidItems.length > 0 ? 'text-danger' : 'text-primary'}`}>
                          {unpaidItems.length > 0 ? 'Tertunda' : 'Lunas'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/admin/tagihan/${group.warga.id}`}
                    className="w-full py-4 md:py-5 bg-slate-900 text-white font-black rounded-xl md:rounded-2xl text-center hover:bg-primary transition-all flex items-center justify-center gap-3 text-sm md:text-base shadow-xl shadow-slate-200 relative z-10"
                  >
                    Atur Pembayaran <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem]">
              <Home className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <div className="text-lg font-bold text-slate-400">Data warga tidak ditemukan.</div>
            </div>
          )}
        </div>
      )}

      {/* Modals - Simplified & Friendly */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b border-slate-100">
              <h3 className="font-bold text-xl md:text-3xl text-slate-900 tracking-tight flex items-center gap-3">
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Buat Tagihan
              </h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Target Warga</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 text-slate-700 font-bold outline-none focus:border-primary rounded-xl text-sm"
                    value={genData.warga_id}
                    onChange={e => setGenData({ ...genData, warga_id: e.target.value })}
                  >
                    <option value="">SELURUH WARGA</option>
                    {wargaList.map(w => (
                      <option key={w.id} value={w.id}>BLOK {w.no_rumah}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Tahun</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 text-slate-700 font-bold outline-none focus:border-primary rounded-xl text-sm"
                    value={genData.tahun}
                    onChange={e => setGenData({ ...genData, tahun: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Bulan Penagihan</label>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setGenData({ ...genData, bulan: (i + 1).toString() })}
                      className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${genData.bulan === (i + 1).toString() ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                    >
                      {getBulanName(i + 1).substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsGenerateModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm">
                  Batal
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Terbitkan Tagihan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
