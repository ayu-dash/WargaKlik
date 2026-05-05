'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { History, TrendingUp, TrendingDown, Wallet, Loader2, Plus, X, Check, Search, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatRupiah, formatDateTime } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminKas() {
  const { hasRole } = useAuth();
  const [kas, setKas] = useState([]);
  const [summary, setSummary] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [jenisFilter, setJenisFilter] = useState('');
  
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
      toast.success('Catatan berhasil disimpan');
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
    <div className="space-y-10 animate-fade-in relative pb-10 font-sans">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Catatan <span className="text-primary">Kas RT</span>
          </h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">
            Laporan masuk dan keluar uang kas secara transparan.
          </p>
        </div>

        {hasRole(['rt', 'wakil_rt', 'sekretaris', 'bendahara']) && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-6 py-3.5 font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Catat Pengeluaran
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">Saldo Kas Saat Ini</div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{formatRupiah(summary.saldo)}</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Pemasukan</div>
            <div className="text-3xl font-black text-blue-600 tracking-tight">{formatRupiah(summary.masuk)}</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-danger" />
          </div>
          <div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Pengeluaran</div>
            <div className="text-3xl font-black text-danger tracking-tight">{formatRupiah(summary.keluar)}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1 w-fit">
        {[
          { id: '', label: 'Semua Catatan' },
          { id: 'masuk', label: 'Pemasukan' },
          { id: 'keluar', label: 'Pengeluaran' }
        ].map((f) => (
          <button 
            key={f.id}
            onClick={() => setJenisFilter(f.id)} 
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${jenisFilter === f.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List Table */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <div className="text-slate-500 font-bold">Memuat catatan kas...</div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-widest">Keterangan</th>
                  <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-widest text-right">Pemasukan</th>
                  <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-widest text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {kas.length > 0 ? (
                  kas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                              <Calendar className="w-4 h-4 text-slate-400" />
                           </div>
                           <span className="text-sm font-bold text-slate-600 whitespace-nowrap">
                             {formatDateTime(item.tanggal)}
                           </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-slate-900 text-lg leading-tight">{item.keterangan}</div>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md text-slate-500">
                             {item.kategori}
                           </span>
                           <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                             <User className="w-3 h-3" /> Oleh: {item.pencatat?.name}
                           </span>
                        </div>
                      </td>
                      <td className="p-6 text-right font-black text-blue-600 text-lg">
                        {item.jenis === 'masuk' ? formatRupiah(item.nominal) : '-'}
                      </td>
                      <td className="p-6 text-right font-black text-danger text-lg">
                        {item.jenis === 'keluar' ? formatRupiah(item.nominal) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <div className="text-lg font-bold text-slate-400">Belum ada catatan kas yang ditemukan.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Friendly Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
              <h3 className="font-bold text-3xl text-slate-900 tracking-tight flex items-center gap-3">
                <History className="w-8 h-8 text-primary" /> Catat Kas
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateKas} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Jenis Catatan</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-700 font-semibold outline-none focus:border-primary rounded-2xl"
                    value={formData.jenis} 
                    onChange={e => setFormData({...formData, jenis: e.target.value})}
                  >
                    <option value="keluar">Pengeluaran</option>
                    <option value="masuk">Pemasukan Lain</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Tanggal</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-700 font-semibold outline-none focus:border-primary rounded-2xl"
                    value={formData.tanggal} 
                    onChange={e => setFormData({...formData, tanggal: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-900 font-black text-2xl outline-none focus:border-primary rounded-2xl"
                  placeholder="0"
                  value={formData.nominal} 
                  onChange={e => setFormData({...formData, nominal: e.target.value})} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">Keterangan / Alasan</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-700 font-semibold outline-none focus:border-primary rounded-2xl"
                  placeholder="Misal: Pembelian sapu lidi" 
                  value={formData.keterangan} 
                  onChange={e => setFormData({...formData, keterangan: e.target.value})} 
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-[2] bg-primary text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
