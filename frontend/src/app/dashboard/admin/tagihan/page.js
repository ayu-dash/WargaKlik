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
    <div className="space-y-8 animate-fade-in relative pb-10 font-sans">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Kelola <span className="text-primary">Tagihan Warga</span>
          </h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">
            Pantau dan validasi iuran warga dengan mudah dan transparan.
          </p>
        </div>

        <button 
          onClick={() => setIsGenerateModalOpen(true)} 
          className="bg-primary text-white px-6 py-3.5 font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Buat Tagihan Baru
        </button>
      </div>

      {/* Stats Summary - Accessible Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Warga</div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{Object.keys(groupedTagihan).length} Rumah</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-danger" />
          </div>
          <div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Tunggakan</div>
            <div className="text-4xl font-black text-danger tracking-tight">
              {formatRupiah(Object.values(groupedTagihan).reduce((acc, g) => 
                acc + g.items.filter(t => t.status !== 'lunas').reduce((s, t) => s + parseFloat(t.total_nominal), 0)
              , 0))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Check className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">Persentase Lunas</div>
            <div className="text-4xl font-black text-secondary tracking-tight">
              {Math.round((tagihan.filter(t => t.status === 'lunas').length / (tagihan.length || 1)) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white border border-slate-200 p-3 rounded-3xl shadow-sm">
        <div className="relative flex-grow w-full max-w-xl">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-50 border-none py-4 pl-14 pr-6 text-slate-900 font-semibold focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl outline-none"
            placeholder="Cari Nama atau Nomor Rumah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1 w-full lg:w-auto overflow-x-auto">
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'belum_bayar', label: 'Belum Bayar' },
            { id: 'lunas', label: 'Sudah Lunas' }
          ].map((f) => (
            <button 
              key={f.id}
              onClick={() => setFilter(f.id)} 
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <div className="text-slate-500 font-bold animate-pulse">Memuat data warga...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Object.keys(groupedTagihan).length > 0 ? (
            Object.values(groupedTagihan).map((group) => {
              const unpaidItems = group.items.filter(t => t.status !== 'lunas');
              const totalUnpaid = unpaidItems.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0);
              
              return (
                <div key={group.warga.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group flex flex-col h-full">
                  <div className="flex items-start gap-5 mb-8 border-b border-slate-50 pb-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {group.warga.no_rumah}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {group.warga.kepala_keluarga}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${unpaidItems.length > 0 ? 'bg-danger animate-pulse' : 'bg-primary'}`} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          {unpaidItems.length > 0 ? `${unpaidItems.length} Bulan Belum Bayar` : 'Sudah Lunas'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 flex-grow mb-8">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tunggakan</span>
                      <span className={`text-3xl font-black ${totalUnpaid > 0 ? 'text-slate-900' : 'text-primary'}`}>
                        {formatRupiah(totalUnpaid)}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-5 rounded-2xl flex justify-between">
                      <div className="text-center flex-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Tagihan</div>
                        <div className="text-lg font-bold text-slate-700">{group.items.length}</div>
                      </div>
                      <div className="w-px bg-slate-200 mx-4" />
                      <div className="text-center flex-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</div>
                        <div className={`text-lg font-bold ${unpaidItems.length > 0 ? 'text-danger' : 'text-primary'}`}>
                          {unpaidItems.length > 0 ? 'Hutang' : 'Lunas'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/dashboard/admin/tagihan/${group.warga.id}`}
                    className="w-full py-4.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-center hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    Lihat Detail Tagihan <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
              <Home className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <div className="text-lg font-bold text-slate-400">Data warga tidak ditemukan.</div>
            </div>
          )}
        </div>
      )}

      {/* Modals - Simplified & Friendly */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
              <h3 className="font-bold text-3xl text-slate-900 tracking-tight">Buat Tagihan Baru</h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Pilih Warga</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-700 font-semibold outline-none focus:border-primary rounded-2xl"
                    value={genData.warga_id} 
                    onChange={e => setGenData({...genData, warga_id: e.target.value})}
                  >
                    <option value="">SEMUA WARGA</option>
                    {wargaList.map(w => (
                      <option key={w.id} value={w.id}>BLOK {w.no_rumah} - {w.kepala_keluarga}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Tahun</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-700 font-semibold outline-none focus:border-primary rounded-2xl"
                    value={genData.tahun} 
                    onChange={e => setGenData({...genData, tahun: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 ml-1">Pilih Bulan</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {[...Array(12)].map((_, i) => (
                    <button 
                      key={i+1}
                      onClick={() => setGenData({...genData, bulan: (i+1).toString()})}
                      className={`py-3 text-sm font-bold rounded-xl border transition-all ${genData.bulan === (i+1).toString() ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {getBulanName(i+1)}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 mt-4"
              >
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                Buat Tagihan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
