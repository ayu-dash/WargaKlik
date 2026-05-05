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
  X
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
        // If no tagihan, fetch warga info separately
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
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const unpaidItems = tagihan.filter(t => t.status !== 'lunas');
  const totalTunggakan = unpaidItems.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/tagihan" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
      </Link>

      <div className="glass-card p-6 border-l-4 border-emerald-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{warga?.kepala_keluarga}</h1>
              <div className="flex flex-wrap gap-3 mt-1">
                <span className="text-sm text-slate-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" /> Blok {warga?.no_rumah}
                </span>
                <span className="text-sm text-slate-400 border-l border-slate-700 pl-3">
                  ID Warga: #{warga?.id}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Tunggakan</p>
              <p className="text-xl font-black text-emerald-400">{formatRupiah(totalTunggakan)}</p>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Belum Lunas</p>
              <p className="text-xl font-black text-white">{unpaidItems.length} <span className="text-xs font-normal text-slate-500">Bulan</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Riwayat & Status Tagihan
        </h2>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button onClick={() => openBayarModal(null)} className="btn-primary flex items-center gap-2 py-2 text-sm px-4">
              <HandCoins className="w-4 h-4" />
              Bayar Terpilih ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={handleGenerateFuture}
            disabled={isGenerating}
            className="btn-secondary flex items-center gap-2 py-2 text-sm border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Tambah Bulan Depan
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                    checked={unpaidItems.length > 0 && selectedIds.length === unpaidItems.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 text-sm font-semibold text-slate-300">Periode</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Nominal</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-300 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tagihan.length > 0 ? (
                tagihan.map((item) => (
                  <tr key={item.id} className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors ${selectedIds.includes(item.id) ? 'bg-emerald-500/5' : ''}`}>
                    <td className="p-4">
                      {item.status !== 'lunas' && (
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{getBulanName(item.bulan)} {item.tahun}</div>
                      <div className="text-[10px] text-slate-500">ID: #{item.id}</div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">{formatRupiah(item.total_nominal)}</td>
                    <td className="p-4">
                      {item.status === 'lunas' ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">Lunas</span>
                        </div>
                      ) : item.status === 'sebagian' ? (
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">Sebagian</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">Belum Bayar</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {item.status !== 'lunas' && (
                        <button 
                          onClick={() => openBayarModal(item)}
                          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center justify-end gap-1 ml-auto"
                        >
                          <HandCoins className="w-4 h-4" /> Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    Belum ada data tagihan untuk warga ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Bayar Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-emerald-400" />
                Catat Pembayaran Manual
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitPembayaran} className="p-6 space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Item yang akan dibayar:</p>
                <div className="max-h-32 overflow-y-auto space-y-2 mb-3">
                  {selectedTagihan.map(t => (
                    <div key={t.id} className="flex justify-between text-sm">
                      <span className="text-slate-300">{getBulanName(t.bulan)} {t.tahun}</span>
                      <span className="text-emerald-400 font-medium">{formatRupiah(t.total_nominal)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-white">
                  <span>Total Tagihan</span>
                  <span className="text-emerald-400">{formatRupiah(selectedTagihan.reduce((sum, t) => sum + parseFloat(t.total_nominal), 0))}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 text-center">Jumlah Diterima (Rp)</label>
                <input 
                  type="number" 
                  readOnly 
                  className="input-field text-2xl text-center font-black bg-slate-800/50 cursor-not-allowed opacity-80" 
                  value={jumlahBayar} 
                />
                <p className="text-[10px] text-slate-500 mt-2 text-center">* Nominal otomatis menyesuaikan total tagihan terpilih</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Catatan (Opsional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Misal: Titipan dari Ibu RT" 
                  value={catatan} 
                  onChange={e => setCatatan(e.target.value)} 
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary py-3"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-2 btn-primary py-3 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Konfirmasi Lunas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
