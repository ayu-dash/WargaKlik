'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { WalletCards, Plus, Edit, Trash2, Loader2, Check, X } from 'lucide-react';
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-emerald-400" />
            Data Master Iuran
          </h1>
          <p className="text-slate-400 text-sm mt-1">Kelola jenis iuran yang dibebankan ke warga</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          Tambah Iuran
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-6 h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {iuran.map((item) => (
            <div key={item.id} className="glass-card p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.nama}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className={`badge ${item.periode === 'bulanan' ? 'badge-danger' : 'badge-info'} px-2 py-0.5 text-[10px]`}>
                      {item.periode?.toUpperCase() || 'BULANAN'}
                    </span>
                    <span className={`badge ${item.is_active ? 'badge-success' : 'bg-slate-700 text-slate-300'} px-2 py-0.5 text-[10px]`}>
                      {item.is_active ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors rounded hover:bg-blue-500/10">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700/50 mt-auto">
                <p className="text-slate-400 text-sm mb-1">Nominal per bulan:</p>
                <p className="text-xl font-bold text-emerald-400">{formatRupiah(item.nominal)}</p>
              </div>
            </div>
          ))}
          {iuran.length === 0 && (
            <div className="col-span-full glass-card p-12 text-center text-slate-400">
              Belum ada data master iuran.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Tambah Master Iuran</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nama Iuran</label>
                <input type="text" required className="input-field" placeholder="Misal: Uang Sampah" 
                  value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nominal (Rp)</label>
                <input type="number" required className="input-field" placeholder="50000" 
                  value={formData.nominal} onChange={e => setFormData({...formData, nominal: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Periode</label>
                  <select className="input-field" value={formData.periode} onChange={e => setFormData({...formData, periode: e.target.value})}>
                    <option value="bulanan">Bulanan</option>
                    <option value="tahunan">Tahunan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select className="input-field" value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
