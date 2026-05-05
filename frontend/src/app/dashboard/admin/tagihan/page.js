'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Receipt, Search, Check, AlertCircle, Clock, Loader2, HandCoins, X, Plus, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatRupiah, getBulanName } from '@/utils/format';
import Link from 'next/link';

export default function AdminTagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('semua');
  
  // Modal Bayar Manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null); // Now can be array
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Generate Tagihan
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genDate, setGenDate] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear()
  });

  useEffect(() => {
    fetchTagihan();
    setSelectedIds([]); // Clear selection on filter change
  }, [filter]);

  const fetchTagihan = async () => {
    setLoading(true);
    try {
      const url = filter === 'semua' ? '/tagihan' : `/tagihan?status=${filter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setTagihan(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil data tagihan');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.post('/tagihan/generate', { 
        bulan: parseInt(genDate.bulan), 
        tahun: parseInt(genDate.tahun) 
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Tagihan berhasil digenerate');
        setIsGenerateModalOpen(false);
        fetchTagihan();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate tagihan');
    } finally {
      setIsGenerating(false);
    }
  };

  const openBayarModal = (item) => {
    if (item) {
      setSelectedTagihan([item]);
      setJumlahBayar(item.total_nominal);
    } else {
      // Bulk mode
      const selectedItems = tagihan.filter(t => selectedIds.includes(t.id));
      setSelectedTagihan(selectedItems);
      const total = selectedItems.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0);
      setJumlahBayar(total);
    }
    setCatatan('');
    setIsModalOpen(true);
  };

  const handleGenerateFuture = async () => {
    if (!selectedTagihan || selectedTagihan.length === 0) return;
    const wargaId = selectedTagihan[0].warga_id;
    setIsGenerating(true);
    try {
      const res = await api.post('/tagihan/generate-future', { 
        warga_id: wargaId,
        count: 1 
      });
      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh tagihan list
        await fetchTagihan();
        // Update selected tagihan if in modal
        if (isModalOpen) {
          const updated = await api.get('/tagihan');
          const newlyCreated = updated.data.data.find(t => 
            t.warga_id === wargaId && 
            t.status === 'belum_bayar' && 
            !selectedTagihan.some(st => st.id === t.id)
          );
          if (newlyCreated) {
            setSelectedTagihan(prev => [...prev, newlyCreated]);
            setJumlahBayar(prev => parseFloat(prev) + parseFloat(newlyCreated.total_nominal));
          }
        }
      }
    } catch (err) {
      toast.error('Gagal membuat tagihan bulan depan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBayarManual = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/pembayaran/manual', {
        tagihan_ids: selectedTagihan.map(t => t.id),
        jumlah_bayar: jumlahBayar,
        tanggal_bayar: new Date().toISOString().split('T')[0],
        catatan
      });
      
      toast.success('Pembayaran manual berhasil dicatat');
      setIsModalOpen(false);
      setSelectedIds([]);
      fetchTagihan();
    } catch (err) {
      toast.error(err.message || 'Gagal mencatat pembayaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTagihan = tagihan.filter(t => 
    t.warga?.kepala_keluarga?.toLowerCase().includes(search.toLowerCase()) || 
    t.warga?.no_rumah?.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            Kelola Tagihan
          </h1>
          <p className="text-slate-400 text-sm mt-1">Pantau pembayaran iuran warga</p>
        </div>

        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button onClick={() => openBayarModal(null)} className="btn-primary flex items-center gap-2 py-2 text-sm px-4">
              <HandCoins className="w-4 h-4" />
              Bayar Sekaligus ({selectedIds.length})
            </button>
          )}
          <button onClick={() => setIsGenerateModalOpen(true)} className="btn-secondary flex items-center gap-2 py-2 text-sm">
            <Plus className="w-4 h-4" />
            Generate Tagihan
          </button>
        </div>
      </div>

      {/* Modal Generate Tagihan */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                Generate Tagihan
              </h2>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <p className="text-sm text-slate-400 mb-4">
                Pilih periode untuk membuat tagihan iuran baru bagi semua warga aktif.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Bulan</label>
                  <select className="input-field" value={genDate.bulan} onChange={e => setGenDate({...genDate, bulan: e.target.value})}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{getBulanName(i+1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tahun</label>
                  <input type="number" className="input-field" value={genDate.tahun} 
                    onChange={e => setGenDate({...genDate, tahun: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsGenerateModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isGenerating} className="btn-primary flex items-center gap-2">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Cari nama atau no rumah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button 
            onClick={() => setFilter('semua')} 
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${filter === 'semua' ? 'bg-emerald-500 text-white' : 'glass text-slate-400 hover:text-white'}`}
          >
            Semua
          </button>
          <button 
            onClick={() => setFilter('belum_bayar')} 
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${filter === 'belum_bayar' ? 'bg-red-500 text-white' : 'glass text-slate-400 hover:text-white'}`}
          >
            Belum Bayar
          </button>
          <button 
            onClick={() => setFilter('lunas')} 
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${filter === 'lunas' ? 'bg-emerald-500 text-white' : 'glass text-slate-400 hover:text-white'}`}
          >
            Lunas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-6 h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(groupedTagihan).length > 0 ? (
            Object.values(groupedTagihan).map((group) => {
              const unpaidItems = group.items.filter(t => t.status !== 'lunas');
              const totalUnpaid = unpaidItems.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0);
              
              return (
                <div key={group.warga.id} className="glass-card p-5 border-l-4 border-emerald-500 hover:bg-slate-800/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <User className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-tight">{group.warga.kepala_keluarga}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Blok {group.warga.no_rumah}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Total Tagihan</span>
                      <span className="text-white font-medium">{group.items.length} Periode</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Belum Lunas</span>
                      <span className={`font-bold ${unpaidItems.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {unpaidItems.length} Periode
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Tunggakan</span>
                      <span className="text-lg font-bold text-emerald-400">{formatRupiah(totalUnpaid)}</span>
                    </div>
                  </div>

                  <Link 
                    href={`/dashboard/admin/tagihan/${group.warga.id}`}
                    className="w-full btn-secondary py-2 flex items-center justify-center gap-2 text-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all"
                  >
                    Kelola Tagihan <Plus className="w-4 h-4" />
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="col-span-full glass-card p-12 text-center text-slate-400">
              Tidak ada data tagihan ditemukan.
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedTagihan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-emerald-400" />
                Catat Pembayaran Tunai
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleBayarManual} className="p-6 space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-slate-400 mb-1">Penerimaan dari:</p>
                <p className="font-bold text-white">{selectedTagihan[0]?.warga?.kepala_keluarga} (Blok {selectedTagihan[0]?.warga?.no_rumah})</p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Detail Tagihan ({selectedTagihan.length}):</p>
                    <button 
                      type="button"
                      onClick={handleGenerateFuture}
                      disabled={isGenerating}
                      className="text-xs text-emerald-400 hover:text-white flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/40 transition-all hover:bg-emerald-500/30 font-medium"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Tambah Bulan Depan
                    </button>
                  </div>
                  {selectedTagihan.map(t => (
                    <div key={t.id} className="flex justify-between text-sm">
                      <span className="text-slate-300">{getBulanName(t.bulan)} {t.tahun}</span>
                      <span className="text-emerald-400">{formatRupiah(t.total_nominal)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-white">
                    <span>Total Tagihan</span>
                    <span className="text-emerald-400">{formatRupiah(selectedTagihan.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0))}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jumlah Bayar (Rp)</label>
                <input type="number" readOnly className="input-field text-lg font-bold bg-slate-800/50 cursor-not-allowed opacity-80" 
                  value={jumlahBayar} />
                <p className="text-[10px] text-slate-500 mt-1">* Nominal otomatis menyesuaikan total tagihan terpilih</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Catatan</label>
                <input type="text" className="input-field" placeholder="Misal: Pembayaran rapel 3 bulan" 
                  value={catatan} onChange={e => setCatatan(e.target.value)} />
              </div>

              <div className="pt-4 mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}    </div>
  );
}
