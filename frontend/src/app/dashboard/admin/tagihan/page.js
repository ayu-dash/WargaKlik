'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Receipt, Search, Check, AlertCircle, Clock, Loader2, HandCoins, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatRupiah, getBulanName } from '@/utils/format';

export default function AdminTagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('semua');
  
  // Modal Bayar Manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTagihan();
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

  const handleGenerate = async () => {
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();
    
    if (!confirm(`Generate tagihan untuk bulan ${getBulanName(bulan)} ${tahun}?`)) return;
    
    try {
      const res = await api.post('/tagihan/generate', { bulan, tahun });
      if (res.data.success) {
        toast.success(res.data.message || 'Tagihan berhasil digenerate');
        fetchTagihan();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate tagihan');
    }
  };

  const openBayarModal = (item) => {
    setSelectedTagihan(item);
    setJumlahBayar(item.total_nominal);
    setCatatan('');
    setIsModalOpen(true);
  };

  const handleBayarManual = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/pembayaran/manual', {
        tagihan_id: selectedTagihan.id,
        jumlah_bayar: jumlahBayar,
        tanggal_bayar: new Date().toISOString().split('T')[0],
        catatan
      });
      
      toast.success('Pembayaran manual berhasil dicatat');
      setIsModalOpen(false);
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

        <button onClick={handleGenerate} className="btn-secondary py-2 text-sm">
          Generate Tagihan Bulan Ini
        </button>
      </div>

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
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700/50">
                  <th className="p-4 text-sm font-semibold text-slate-300">Warga</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Periode</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Nominal</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="p-4 text-sm font-semibold text-slate-300 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTagihan.length > 0 ? (
                  filteredTagihan.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{item.warga?.kepala_keluarga}</div>
                        <div className="text-xs text-slate-400">Blok {item.warga?.no_rumah}</div>
                      </td>
                      <td className="p-4 text-slate-300">{getBulanName(item.bulan)} {item.tahun}</td>
                      <td className="p-4 font-medium text-emerald-400">{formatRupiah(item.total_nominal)}</td>
                      <td className="p-4">
                        {item.status === 'lunas' ? (
                          <span className="badge badge-success px-2 py-1 text-xs">Lunas</span>
                        ) : item.status === 'sebagian' ? (
                          <span className="badge badge-warning px-2 py-1 text-xs">Sebagian</span>
                        ) : (
                          <span className="badge badge-danger px-2 py-1 text-xs">Belum Bayar</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {item.status !== 'lunas' && (
                          <button 
                            onClick={() => openBayarModal(item)}
                            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center justify-end gap-1 ml-auto"
                          >
                            <HandCoins className="w-4 h-4" /> Bayar Manual
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Tidak ada data tagihan ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-4">
                <p className="text-sm text-slate-400 mb-1">Penerimaan dari:</p>
                <p className="font-bold text-white">{selectedTagihan.warga?.kepala_keluarga} (Blok {selectedTagihan.warga?.no_rumah})</p>
                <p className="text-sm text-slate-400 mt-2">Tagihan Bulan: {getBulanName(selectedTagihan.bulan)} {selectedTagihan.tahun}</p>
                <p className="font-bold text-emerald-400 mt-1">{formatRupiah(selectedTagihan.total_nominal)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jumlah Bayar (Rp)</label>
                <input type="number" required className="input-field text-lg font-bold" 
                  value={jumlahBayar} onChange={e => setJumlahBayar(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Catatan</label>
                <input type="text" className="input-field" placeholder="Misal: Dititipkan ke satpam" 
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
      )}
    </div>
  );
}
