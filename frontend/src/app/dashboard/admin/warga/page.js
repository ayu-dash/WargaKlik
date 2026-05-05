'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Users, Search, Plus, UserPlus, Check, X, Edit, Trash2, Loader2, Receipt } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminWarga() {
  const [warga, setWarga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    no_rumah: '',
    kepala_keluarga: '',
    status: 'aktif',
    name: '',
    email: '',
    no_telepon: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWarga();
  }, []);

  const fetchWarga = async () => {
    try {
      const res = await api.get('/warga');
      if (res.data.success) {
        setWarga(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil data warga');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/warga', {
        name: formData.name,
        email: formData.email,
        no_telepon: formData.no_telepon,
        no_rumah: formData.no_rumah,
        kepala_keluarga: formData.kepala_keluarga,
        // The backend uses 'aktif'/'pindah' logic internally or defaults to active
      });
      
      toast.success('Data warga berhasil ditambahkan');
      setIsModalOpen(false);
      fetchWarga();
      setFormData({ no_rumah: '', kepala_keluarga: '', status: 'aktif', name: '', email: '', no_telepon: '' });
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan warga');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWarga = warga.filter(w => 
    w.kepala_keluarga.toLowerCase().includes(search.toLowerCase()) || 
    w.no_rumah.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Data Warga
          </h1>
          <p className="text-slate-400 text-sm mt-1">Kelola data warga RT</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 py-2.5 px-4 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Warga</span>
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
                  <th className="p-4 text-sm font-semibold text-slate-300">No. Rumah</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Kepala Keluarga</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Email (User)</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="p-4 text-sm font-semibold text-slate-300 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarga.length > 0 ? (
                  filteredWarga.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                          {item.no_rumah}
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium">{item.kepala_keluarga}</td>
                      <td className="p-4 text-slate-400">{item.user?.email || '-'}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {item.status === 'aktif' ? (
                            <span className="badge badge-success px-2 py-1 text-[10px] w-fit">Aktif</span>
                          ) : (
                            <span className="badge badge-danger px-2 py-1 text-[10px] w-fit">Pindah</span>
                          )}
                          {item.iuran_custom?.length > 0 && (
                            <span className="badge badge-info px-2 py-1 text-[10px] w-fit">Kustom</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/admin/warga/${item.id}`}
                            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors rounded hover:bg-emerald-500/10"
                            title="Atur Iuran">
                            <Receipt className="w-4 h-4" />
                          </Link>
                          <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded hover:bg-blue-500/10">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Tidak ada data warga ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Warga */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Tambah Data Warga
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="wargaForm" onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">No. Rumah</label>
                    <input type="text" required className="input-field" placeholder="A-01" 
                      value={formData.no_rumah} onChange={e => setFormData({...formData, no_rumah: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                    <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="aktif">Aktif</option>
                      <option value="pindah">Pindah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Kepala Keluarga</label>
                  <input type="text" required className="input-field" placeholder="Nama Kepala Keluarga" 
                    value={formData.kepala_keluarga} onChange={e => setFormData({...formData, kepala_keluarga: e.target.value})} />
                </div>

                <div className="border-t border-slate-700/50 pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Data Akun (User)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Nama Pengguna</label>
                      <input type="text" required className="input-field" placeholder="Nama Lengkap" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                      <input type="email" required className="input-field" placeholder="email@example.com" 
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">No. WhatsApp</label>
                      <input type="text" className="input-field" placeholder="08123456789" 
                        value={formData.no_telepon} onChange={e => setFormData({...formData, no_telepon: e.target.value})} />
                    </div>
                  </div>
                  <p className="text-xs text-amber-400 mt-3">
                    * Password default: <strong>password123</strong>. Warga akan diminta mengganti password saat aktivasi.
                  </p>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                Batal
              </button>
              <button type="submit" form="wargaForm" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
