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
    <div className="space-y-6 md:space-y-10 relative pb-10 font-sans max-w-6xl mx-auto px-4 sm:px-0">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6 md:pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Master <span className="text-primary">Iuran Warga</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">Tentukan jenis dan nominal iuran resmi lingkungan.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-primary text-white px-8 py-4 md:py-5 font-black rounded-xl md:rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-base md:text-lg"
        >
          <Plus className="w-6 h-6" />
          Tambah Jenis Iuran
        </button>
      </div>

      {loading ? (
        <div className="h-64 md:h-96 flex flex-col items-center justify-center bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <div className="text-slate-500 font-bold text-lg">Memuat data iuran...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {iuran.map((item) => (
            <div key={item.id} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between group hover:border-primary/20 hover:scale-[1.02] transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                    <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl hover:bg-red-50 hover:text-danger transition-all border border-transparent hover:border-red-100">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">{item.nama}</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${item.periode === 'bulanan' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                      <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" /> {item.periode || 'BULANAN'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${item.is_active ? 'bg-emerald-50 text-primary border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5" /> {item.is_active ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 pt-6 md:pt-8 border-t border-slate-50 mt-auto">
                <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1 md:mb-2">Besaran Iuran</div>
                <div className="text-2xl md:text-4xl font-black text-primary tracking-tighter leading-none">{formatRupiah(item.nominal)}</div>
              </div>
            </div>
          ))}
          {iuran.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem]">
              <WalletCards className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <div className="text-lg font-bold text-slate-400">Belum ada pengaturan master iuran.</div>
            </div>
          )}
        </div>
      )}

      {/* Modal - Friendly Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] w-full max-w-xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b border-slate-100">
              <h3 className="font-bold text-xl md:text-3xl text-slate-900 tracking-tight flex items-center gap-3">
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Master Iuran
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Nama Jenis Iuran</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-3 text-slate-900 font-bold outline-none focus:border-primary rounded-xl text-sm"
                  placeholder="Misal: Iuran Keamanan" 
                  value={formData.nama} 
                  onChange={e => setFormData({...formData, nama: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-3 text-slate-900 font-black text-xl outline-none focus:border-primary rounded-xl"
                  placeholder="0" 
                  value={formData.nominal} 
                  onChange={e => setFormData({...formData, nominal: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Periode</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 text-slate-700 font-bold outline-none focus:border-primary rounded-xl text-sm"
                    value={formData.periode} 
                    onChange={e => setFormData({...formData, periode: e.target.value})}
                  >
                    <option value="bulanan">Bulanan</option>
                    <option value="tahunan">Tahunan</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1">Status</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 text-slate-700 font-bold outline-none focus:border-primary rounded-xl text-sm"
                    value={formData.is_active} 
                    onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Simpan Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
