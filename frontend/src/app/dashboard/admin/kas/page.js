'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { History, TrendingUp, TrendingDown, Wallet, Loader2, Plus, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatRupiah, formatDateTime } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminKas() {
  const { hasRole } = useAuth();
  const [kas, setKas] = useState([]);
  const [summary, setSummary] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [jenisFilter, setJenisFilter] = useState('');
  
  // Modal Kas Manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    jenis: 'keluar',
    kategori: 'operasional',
    nominal: '',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKas();
  }, [jenisFilter]);

  const fetchKas = async () => {
    setLoading(true);
    try {
      const url = jenisFilter ? `/kas?jenis=${jenisFilter}` : '/kas';
      const res = await api.get(url);
      if (res.data.success) {
        setKas(res.data.data);
        setSummary(res.data.pagination.summary);
      }
    } catch (err) {
      toast.error('Gagal mengambil data kas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKas = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/kas', formData);
      toast.success('Pencatatan kas berhasil');
      setIsModalOpen(false);
      fetchKas();
      setFormData({
        jenis: 'keluar', kategori: 'operasional', nominal: '', tanggal: new Date().toISOString().split('T')[0], keterangan: ''
      });
    } catch (err) {
      toast.error('Gagal mencatat kas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            Buku Kas Umum
          </h1>
          <p className="text-slate-400 text-sm mt-1">Rekap seluruh transaksi keuangan RT</p>
        </div>

        {hasRole(['rt', 'wakil_rt', 'sekretaris', 'bendahara']) && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 py-2.5 px-4"
          >
            <Plus className="w-4 h-4" />
            Catat Pengeluaran
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <div className="text-sm text-slate-400 mb-1 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" /> Saldo Kas
          </div>
          <div className="text-2xl font-bold text-white">{formatRupiah(summary.saldo)}</div>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-blue-500">
          <div className="text-sm text-slate-400 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Total Pemasukan
          </div>
          <div className="text-xl font-bold text-white">{formatRupiah(summary.masuk)}</div>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-red-500">
          <div className="text-sm text-slate-400 mb-1 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" /> Total Pengeluaran
          </div>
          <div className="text-xl font-bold text-white">{formatRupiah(summary.keluar)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setJenisFilter('')} className={`px-4 py-2 rounded-lg text-sm ${!jenisFilter ? 'bg-emerald-500 text-white' : 'glass text-slate-400 hover:text-white'}`}>Semua</button>
        <button onClick={() => setJenisFilter('masuk')} className={`px-4 py-2 rounded-lg text-sm ${jenisFilter === 'masuk' ? 'bg-blue-500 text-white' : 'glass text-slate-400 hover:text-white'}`}>Pemasukan</button>
        <button onClick={() => setJenisFilter('keluar')} className={`px-4 py-2 rounded-lg text-sm ${jenisFilter === 'keluar' ? 'bg-red-500 text-white' : 'glass text-slate-400 hover:text-white'}`}>Pengeluaran</button>
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
                  <th className="p-4 text-sm font-semibold text-slate-300">Tanggal</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Keterangan</th>
                  <th className="p-4 text-sm font-semibold text-slate-300 text-right">Pemasukan</th>
                  <th className="p-4 text-sm font-semibold text-slate-300 text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {kas.length > 0 ? (
                  kas.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-slate-300 text-sm whitespace-nowrap">
                        {formatDateTime(item.tanggal)}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{item.keterangan}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                          <span className="uppercase px-1.5 py-0.5 bg-slate-800 rounded">{item.kategori}</span>
                          <span>Oleh: {item.pencatat?.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-blue-400">
                        {item.jenis === 'masuk' ? formatRupiah(item.nominal) : '-'}
                      </td>
                      <td className="p-4 text-right font-medium text-red-400">
                        {item.jenis === 'keluar' ? formatRupiah(item.nominal) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      Tidak ada catatan kas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Input Kas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Catat Pengeluaran / Pemasukan
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateKas} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Jenis</label>
                  <select className="input-field" value={formData.jenis} onChange={e => setFormData({...formData, jenis: e.target.value})}>
                    <option value="keluar">Pengeluaran</option>
                    <option value="masuk">Pemasukan Lain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal</label>
                  <input type="date" required className="input-field" 
                    value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nominal (Rp)</label>
                <input type="number" required className="input-field text-lg font-bold" 
                  value={formData.nominal} onChange={e => setFormData({...formData, nominal: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Keterangan</label>
                <input type="text" required className="input-field" placeholder="Misal: Biaya angkut sampah" 
                  value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} />
              </div>

              <div className="pt-4 mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
