'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Users, Search, Plus, UserPlus, Check, X, Edit, Trash2, Loader2, Receipt, Home, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminWarga() {
  const [warga, setWarga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
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
    <div className="space-y-10 animate-fade-in relative pb-10 font-sans">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-slate-200 pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Data <span className="text-primary">Warga RT</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Kelola daftar rumah dan penduduk di lingkungan kita.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="w-full bg-white border border-slate-200 py-4.5 pl-14 pr-6 text-slate-900 font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-[1.5rem] outline-none shadow-sm"
              placeholder="Cari nama atau no rumah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-primary text-white px-8 py-4.5 font-bold rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <UserPlus className="w-6 h-6" />
            Tambah Warga Baru
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <div className="text-slate-500 font-bold">Menyiapkan data warga...</div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest">No. Rumah</th>
                  <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest">Kepala Keluarga</th>
                  <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest">Akun & Kontak</th>
                  <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredWarga.length > 0 ? (
                  filteredWarga.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-8">
                        <div className="w-16 h-16 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white font-black text-xl shadow-lg">
                          {item.no_rumah}
                        </div>
                      </td>
                      <td className="p-8 font-extrabold text-slate-900 text-xl group-hover:text-primary transition-colors">
                        {item.kepala_keluarga}
                      </td>
                      <td className="p-8">
                        <div className="space-y-1">
                           <div className="text-sm font-bold text-slate-700">{item.user?.email || 'Belum ada email'}</div>
                           <div className="text-xs font-medium text-slate-400">{item.no_telepon || 'No HP tidak ada'}</div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2">
                          {item.status === 'aktif' ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                               <Check className="w-3.5 h-3.5" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-danger px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-red-100">
                               <X className="w-3.5 h-3.5" /> Pindah
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/dashboard/admin/warga/${item.id}`}
                            className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="Atur Iuran">
                            <Receipt className="w-5 h-5" />
                          </Link>
                          <button className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-danger hover:text-white transition-all shadow-sm">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Home className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <div className="text-lg font-bold text-slate-400">Tidak ada data warga yang cocok.</div>
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
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 md:p-14 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
              <h3 className="font-bold text-3xl text-slate-900 tracking-tight flex items-center gap-4">
                <UserPlus className="w-10 h-10 text-primary" /> Tambah Warga
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Nomor Rumah (Blok)</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-900 font-black text-xl outline-none focus:border-primary rounded-[1.5rem]"
                    placeholder="Contoh: A-01" 
                    value={formData.no_rumah} 
                    onChange={e => setFormData({...formData, no_rumah: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Nama Kepala Keluarga</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-900 font-bold text-lg outline-none focus:border-primary rounded-[1.5rem]"
                    placeholder="Nama Lengkap KK" 
                    value={formData.kepala_keluarga} 
                    onChange={e => setFormData({...formData, kepala_keluarga: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                   </div>
                   <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Data Akun & Akses</h4>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 ml-1">Nama Lengkap Pengguna</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-700 font-bold outline-none focus:border-primary rounded-[1.5rem]"
                      placeholder="Gunakan nama asli" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Alamat Email</label>
                      <input 
                        type="email" 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-700 font-bold outline-none focus:border-primary rounded-[1.5rem]"
                        placeholder="email@warga.com" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Nomor WhatsApp</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-700 font-bold outline-none focus:border-primary rounded-[1.5rem]"
                        placeholder="08123456789" 
                        value={formData.no_telepon} 
                        onChange={e => setFormData({...formData, no_telepon: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100 flex gap-4">
                   <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-sm font-medium text-amber-700 leading-relaxed">
                     Kata sandi awal adalah <strong className="font-black">password123</strong>. 
                     Warga wajib mengganti kata sandi demi keamanan saat pertama kali masuk ke sistem.
                   </p>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-full sm:flex-1 py-5 bg-slate-100 text-slate-700 font-bold rounded-[1.5rem] hover:bg-slate-200 transition-all text-lg"
                >
                  Batalkan
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full sm:flex-[2] bg-primary text-white py-5 rounded-[1.5rem] font-bold text-xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Check className="w-7 h-7" />}
                  Simpan Data Warga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
