'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { History, TrendingUp, TrendingDown, Wallet, Loader2, Plus, X, Check, Search, Calendar, FileText, User } from 'lucide-react';
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
    <div className="space-y-6 md:space-y-10 relative pb-10 font-sans max-w-6xl mx-auto px-4 sm:px-0">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6 md:pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Catatan <span className="text-primary">Kas RT</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">
            Laporan masuk dan keluar uang kas secara transparan.
          </p>
        </div>

        {hasRole(['rt', 'wakil_rt', 'sekretaris', 'bendahara']) && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-primary text-white px-8 py-4 md:py-5 font-black rounded-xl md:rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-base md:text-lg"
          >
            <Plus className="w-6 h-6" />
            Catat Transaksi
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-4 md:space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 rounded-2xl md:rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 md:mb-2">Saldo Kas Saat Ini</div>
            <div className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{formatRupiah(summary.saldo)}</div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-4 md:space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-2xl md:rounded-3xl flex items-center justify-center border border-blue-100 shadow-sm">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 md:mb-2">Total Pemasukan</div>
            <div className="text-2xl md:text-4xl font-black text-blue-600 tracking-tighter leading-none">{formatRupiah(summary.masuk)}</div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-4 md:space-y-6 relative overflow-hidden group sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-2xl md:rounded-3xl flex items-center justify-center border border-red-100 shadow-sm">
            <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-danger" />
          </div>
          <div className="relative z-10">
            <div className="text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 md:mb-2">Total Pengeluaran</div>
            <div className="text-2xl md:text-4xl font-black text-danger tracking-tighter leading-none">{formatRupiah(summary.keluar)}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1.5 md:p-2 bg-slate-100/80 rounded-2xl md:rounded-3xl gap-1 w-full md:w-fit overflow-x-auto no-scrollbar backdrop-blur-sm border border-white">
        {[
          { id: '', label: 'Semua Catatan' },
          { id: 'masuk', label: 'Pemasukan' },
          { id: 'keluar', label: 'Pengeluaran' }
        ].map((f) => (
          <button 
            key={f.id}
            onClick={() => setJenisFilter(f.id)} 
            className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black transition-all whitespace-nowrap tracking-wide uppercase ${jenisFilter === f.id ? 'bg-white text-primary shadow-lg shadow-primary/10 ring-1 ring-primary/5' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List Table/Cards */}
      {loading ? (
        <div className="h-64 md:h-96 flex flex-col items-center justify-center bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <div className="text-slate-500 font-bold text-lg">Memuat riwayat kas...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile View - Cards */}
          <div className="grid md:hidden gap-4">
            {kas.length > 0 ? (
              kas.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-md space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md w-fit">
                        {formatDateTime(item.tanggal)}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight pt-1">{item.keterangan}</h3>
                    </div>
                    <div className={`p-2 rounded-xl border ${item.jenis === 'masuk' ? 'bg-emerald-50 border-emerald-100 text-primary' : 'bg-red-50 border-red-100 text-danger'}`}>
                      {item.jenis === 'masuk' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 py-3 border-y border-slate-50">
                    <div className="flex-1">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kategori</div>
                      <div className="text-sm font-bold text-slate-700 capitalize">{item.kategori}</div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Oleh</div>
                      <div className="text-sm font-bold text-slate-700 truncate">{item.pencatat?.name}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nominal</div>
                    <div className={`text-xl font-black tracking-tight ${item.jenis === 'masuk' ? 'text-blue-600' : 'text-danger'}`}>
                      {formatRupiah(item.nominal)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 text-center rounded-[2rem] border border-dashed border-slate-200">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <div className="text-slate-400 font-bold">Belum ada catatan kas.</div>
              </div>
            )}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Waktu & Tanggal</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Uraian Keterangan</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Debit</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Kredit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kas.length > 0 ? (
                    kas.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary transition-all shadow-sm">
                                <Calendar className="w-5 h-5" />
                             </div>
                             <span className="text-sm font-black text-slate-600">
                               {formatDateTime(item.tanggal)}
                             </span>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="font-black text-slate-900 text-lg tracking-tight leading-tight group-hover:text-primary transition-colors">{item.keterangan}</div>
                          <div className="flex items-center gap-4 mt-3">
                             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500 border border-slate-200 shadow-sm">
                               {item.kategori}
                             </span>
                             <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                 <User className="w-3 h-3" />
                               </div>
                               Pencatat: {item.pencatat?.name}
                             </span>
                          </div>
                        </td>
                        <td className="p-8 text-right font-black text-blue-600 text-xl tracking-tighter">
                          {item.jenis === 'masuk' ? formatRupiah(item.nominal) : '-'}
                        </td>
                        <td className="p-8 text-right font-black text-danger text-xl tracking-tighter">
                          {item.jenis === 'keluar' ? formatRupiah(item.nominal) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-24 text-center">
                        <FileText className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                        <div className="text-xl font-black text-slate-300">Belum ada catatan transaksi kas.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Friendly Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] w-full max-w-xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b border-slate-100">
              <h3 className="font-bold text-xl md:text-3xl text-slate-900 tracking-tight flex items-center gap-3">
                <History className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Catat Kas
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateKas} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Jenis</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 text-slate-700 font-semibold outline-none focus:border-primary rounded-xl text-sm"
                    value={formData.jenis} 
                    onChange={e => setFormData({...formData, jenis: e.target.value})}
                  >
                    <option value="keluar">Pengeluaran</option>
                    <option value="masuk">Pemasukan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Tanggal</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 text-slate-700 font-semibold outline-none focus:border-primary rounded-xl text-sm"
                    value={formData.tanggal} 
                    onChange={e => setFormData({...formData, tanggal: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-3 text-slate-900 font-black text-lg outline-none focus:border-primary rounded-xl"
                  placeholder="0"
                  value={formData.nominal} 
                  onChange={e => setFormData({...formData, nominal: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Keterangan</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 text-slate-700 font-semibold outline-none focus:border-primary rounded-xl text-sm"
                  placeholder="Contoh: Pembelian sapu" 
                  value={formData.keterangan} 
                  onChange={e => setFormData({...formData, keterangan: e.target.value})} 
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Simpan Catatan Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
