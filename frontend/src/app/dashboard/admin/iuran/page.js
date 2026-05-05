'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { WalletCards, Plus, Edit, Trash2, Loader2, Check, X, ShieldCheck, CreditCard, Calendar, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatRupiah } from '@/utils/format';

export default function AdminIuran() {
  const [iuran, setIuran] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    nominal: '',
    periode: 'bulanan',
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchIuran();
  }, []);

  const fetchIuran = async () => {
    try {
      const res = await api.get('/iuran');
      if (res.data.success) {
        setIuran(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil data master iuran');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/iuran', formData);
      toast.success('Master iuran berhasil ditambahkan');
      setIsModalOpen(false);
      fetchIuran();
      setFormData({ nama: '', nominal: '', periode: 'bulanan', is_active: true });
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan iuran');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in relative pb-10 font-sans max-w-6xl mx-auto">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Master <span className="text-primary">Iuran Warga</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Tentukan jenis dan nominal iuran resmi lingkungan.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-4 font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
        >
          <Plus className="w-6 h-6" />
          Tambah Jenis Iuran
        </button>
      </div>

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <div className="text-slate-500 font-bold">Memuat data iuran...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {iuran.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between group hover:border-primary/20 hover:scale-[1.02] transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm">
                    <CreditCard className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-danger transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{item.nama}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.periode === 'bulanan' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                      <Calendar className="w-3 h-3" /> {item.periode || 'BULANAN'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.is_active ? 'bg-emerald-50 text-primary border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      <Activity className="w-3 h-3" /> {item.is_active ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 pt-6 border-t border-slate-50 mt-auto">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Besaran Iuran</div>
                <div className="text-3xl font-black text-primary tracking-tight">{formatRupiah(item.nominal)}</div>
              </div>
            </div>
          ))}
          {iuran.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
              <WalletCards className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <div className="text-lg font-bold text-slate-400">Belum ada pengaturan master iuran.</div>
            </div>
          )}
        </div>
      )}

      {/* Modal - Friendly Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 md:p-14 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
              <h3 className="font-bold text-3xl text-slate-900 tracking-tight flex items-center gap-4">
                <Plus className="w-8 h-8 text-primary" /> Master Iuran
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">Nama Jenis Iuran</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-900 font-bold text-lg outline-none focus:border-primary rounded-2xl"
                  placeholder="Misal: Iuran Keamanan" 
                  value={formData.nama} 
                  onChange={e => setFormData({...formData, nama: e.target.value})} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">Nominal Bulanan (Rp)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-900 font-black text-2xl outline-none focus:border-primary rounded-2xl"
                  placeholder="0" 
                  value={formData.nominal} 
                  onChange={e => setFormData({...formData, nominal: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Periode Penagihan</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-700 font-bold outline-none focus:border-primary rounded-[1.2rem]"
                    value={formData.periode} 
                    onChange={e => setFormData({...formData, periode: e.target.value})}
                  >
                    <option value="bulanan">Setiap Bulan</option>
                    <option value="tahunan">Setiap Tahun</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Status Penggunaan</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-700 font-bold outline-none focus:border-primary rounded-[1.2rem]"
                    value={formData.is_active} 
                    onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}
                  >
                    <option value="true">Aktif & Digunakan</option>
                    <option value="false">Nonaktif / Arsip</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-primary text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Check className="w-7 h-7" />}
                  Simpan Master Iuran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
