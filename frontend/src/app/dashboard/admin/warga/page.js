'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Search, Plus, UserPlus, Check, X, Edit, UserX, Loader2, Receipt, Home, ShieldCheck, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminWarga() {
  const { hasRole } = useAuth();
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
    no_telepon: '',
    status_rumah: 'tetap',
    jumlah_anggota: 1,
    no_kk: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        no_telepon: formData.no_telepon,
        no_rumah: formData.no_rumah,
        kepala_keluarga: formData.kepala_keluarga,
        status_rumah: formData.status_rumah,
        jumlah_anggota: formData.jumlah_anggota,
        no_kk: formData.no_kk,
        is_active: formData.status === 'aktif'
      };

      if (editingId) {
        await api.put(`/warga/${editingId}`, payload);
        toast.success('Data warga berhasil diperbarui');
      } else {
        await api.post('/warga', payload);
        toast.success('Data warga berhasil ditambahkan');
      }
      
      setIsModalOpen(false);
      fetchWarga();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data warga');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      no_rumah: '', 
      kepala_keluarga: '', 
      status: 'aktif', 
      name: '', 
      email: '', 
      no_telepon: '',
      status_rumah: 'tetap',
      jumlah_anggota: 1,
      no_kk: ''
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      no_rumah: item.no_rumah,
      kepala_keluarga: item.kepala_keluarga,
      status: item.is_active ? 'aktif' : 'nonaktif',
      name: item.user?.name || '',
      email: item.user?.email || '',
      no_telepon: item.user?.no_telepon || '',
      status_rumah: item.status_rumah || 'tetap',
      jumlah_anggota: item.jumlah_anggota || 1,
      no_kk: item.no_kk || ''
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/warga/${deletingId}`);
      toast.success('Data warga berhasil dihapus');
      setIsDeleteModalOpen(false);
      fetchWarga();
    } catch (err) {
      toast.error('Gagal menghapus warga');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const filteredWarga = warga.filter(w => 
    w.kepala_keluarga.toLowerCase().includes(search.toLowerCase()) || 
    w.no_rumah.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6 md:space-y-10 pb-10 relative px-4 sm:px-0">
        <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8 border-b border-slate-200 pb-6 md:pb-10">
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
              Data <span className="text-primary">Warga RT</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-lg font-medium">
              Kelola daftar rumah dan penduduk di lingkungan kita.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-4 md:left-5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="w-full bg-white border border-slate-200 py-3.5 md:py-4.5 pl-11 md:pl-14 pr-6 text-slate-900 font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-xl md:rounded-[1.5rem] outline-none shadow-sm text-sm md:text-base"
                placeholder="Cari nama atau no rumah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {hasRole(['rt', 'wakil_rt', 'sekretaris']) && (
              <button 
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-primary text-white px-6 md:px-8 py-3.5 md:py-4.5 font-bold rounded-xl md:rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap text-sm md:text-base"
              >
                <UserPlus className="w-5 h-5 md:w-6 md:h-6" />
                Tambah Warga Baru
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="h-60 md:h-80 flex flex-col items-center justify-center bg-white rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-sm">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-primary animate-spin mb-4" />
            <div className="text-slate-500 text-sm md:text-base font-bold">Menyiapkan data warga...</div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-0">
            {/* Card List for Mobile */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredWarga.length > 0 ? (
                filteredWarga.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-md shadow-slate-200/40 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
                        {item.no_rumah}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 text-base truncate">{item.kepala_keluarga}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.user?.email || 'Tanpa Email'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        {item.status_rumah === 'tetap' && (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                             Tetap
                          </span>
                        )}
                        {item.status_rumah === 'kontrak' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100">
                             Kontrak
                          </span>
                        )}
                        {item.status_rumah === 'kosong' && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">
                             Kosong
                          </span>
                        )}
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-primary px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                            <Check className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-danger px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
                            <X className="w-3 h-3" /> Nonaktif
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <Link href={`/dashboard/admin/tagihan/${item.id}`}
                            className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="Detail Tagihan">
                            <Receipt className="w-4 h-4" />
                          </Link>
                          <Link href={`/dashboard/admin/warga/${item.id}`}
                            className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200 transition-all shadow-sm"
                            title="Pengaturan Iuran">
                            <Settings className="w-4 h-4" />
                          </Link>
                        {hasRole(['rt', 'wakil_rt', 'sekretaris']) && (
                          <>
                             <button 
                               onClick={() => openEditModal(item)}
                               className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                               <Edit className="w-4 h-4" />
                             </button>
                            <button 
                              onClick={() => confirmDelete(item.id)}
                              disabled={item.unpaid_count > 0}
                              className={`w-9 h-9 flex items-center justify-center bg-slate-50 rounded-xl transition-all shadow-sm ${item.unpaid_count > 0 ? 'opacity-30 cursor-not-allowed text-slate-300' : 'text-slate-400 hover:bg-danger hover:text-white'}`}
                              title={item.unpaid_count > 0 ? `Tidak bisa hapus: Ada ${item.unpaid_count} tunggakan` : 'Hapus Warga'}>
                              <UserX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-dashed border-slate-200 p-12 text-center rounded-[2rem] flex flex-col items-center">
                  <Home className="w-12 h-12 text-slate-200 mb-4" />
                  <div className="text-sm font-bold text-slate-400">Tidak ada data warga.</div>
                </div>
              )}
            </div>

            {/* Table for Desktop */}
            <div className="hidden md:block bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
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
                               <div className="text-xs font-medium text-slate-400">{item.user?.no_telepon || 'No HP tidak ada'}</div>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                {item.is_active ? (
                                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                     <Check className="w-3 h-3" /> Aktif
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-danger px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                                     <X className="w-3 h-3" /> Nonaktif
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {item.status_rumah === 'tetap' && (
                                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                     Milik Tetap
                                  </span>
                                )}
                                {item.status_rumah === 'kontrak' && (
                                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                     Kontrak
                                  </span>
                                )}
                                {item.status_rumah === 'kosong' && (
                                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                     Kosong
                                  </span>
                                )}
                              </div>
                            </div>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex items-center justify-end gap-3">
                              <Link href={`/dashboard/admin/tagihan/${item.id}`}
                                className="w-12 h-12 flex items-center justify-center bg-emerald-50 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                title="Detail Tagihan">
                                <Receipt className="w-5 h-5" />
                              </Link>
                              <Link href={`/dashboard/admin/warga/${item.id}`}
                                className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all shadow-sm"
                                title="Pengaturan Iuran">
                                <Settings className="w-5 h-5" />
                              </Link>
                              {hasRole(['rt', 'wakil_rt', 'sekretaris']) && (
                                <>
                                   <button 
                                     onClick={() => openEditModal(item)}
                                     className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                     <Edit className="w-5 h-5" />
                                   </button>
                                  <button 
                                    onClick={() => confirmDelete(item.id)}
                                    disabled={item.unpaid_count > 0}
                                    className={`w-12 h-12 flex items-center justify-center bg-slate-100 rounded-2xl transition-all shadow-sm ${item.unpaid_count > 0 ? 'opacity-30 cursor-not-allowed text-slate-300' : 'text-slate-500 hover:bg-danger hover:text-white'}`}
                                    title={item.unpaid_count > 0 ? `Tidak bisa hapus: Ada ${item.unpaid_count} tunggakan` : 'Hapus Warga'}>
                                    <UserX className="w-5 h-5" />
                                  </button>
                                </>
                              )}
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
          </div>
        )}
      </div>

      {/* Modal - Friendly Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl p-6 md:p-7 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-xl md:text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                {editingId ? <Edit className="w-6 h-6 text-primary" /> : <UserPlus className="w-6 h-6 text-primary" />}
                {editingId ? 'Edit Data Warga' : 'Tambah Warga Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 ml-1">Nomor Rumah (Blok)</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 font-black text-lg outline-none focus:border-primary rounded-xl uppercase"
                    placeholder="A-01" 
                    value={formData.no_rumah} 
                    onChange={e => setFormData({...formData, no_rumah: e.target.value.toUpperCase()})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 ml-1">Nama Kepala Keluarga</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:border-primary rounded-xl"
                    placeholder="Nama Lengkap KK" 
                    value={formData.kepala_keluarga} 
                    onChange={e => setFormData({...formData, kepala_keluarga: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 ml-1">Status Rumah</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:border-primary rounded-xl appearance-none cursor-pointer"
                    value={formData.status_rumah}
                    onChange={e => setFormData({...formData, status_rumah: e.target.value})}
                  >
                    <option value="tetap">Rumah Tetap (Milik)</option>
                    <option value="kontrak">Kontrak / Sewa</option>
                    <option value="kosong">Kosong</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 ml-1">Jumlah Anggota Keluarga</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:border-primary rounded-xl"
                    value={formData.jumlah_anggota} 
                    onChange={e => setFormData({...formData, jumlah_anggota: parseInt(e.target.value)})} 
                  />
                </div>
              </div>

              {editingId && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 ml-1">Status Keaktifan</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 font-bold text-sm outline-none focus:border-primary rounded-xl appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="aktif">Aktif (Tinggal di Sini)</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                   <ShieldCheck className="w-4 h-4 text-primary" />
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akun & Kontak</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="block text-xs font-bold text-slate-600 ml-1">Nama Lengkap Pengguna</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-700 font-bold outline-none focus:border-primary rounded-xl text-sm"
                      placeholder="Nama asli sesuai KTP" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 ml-1">Email</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-700 font-bold outline-none focus:border-primary rounded-xl text-sm"
                      placeholder="email@warga.com" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 ml-1">WhatsApp</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-700 font-bold outline-none focus:border-primary rounded-xl text-sm"
                      placeholder="08123456789" 
                      value={formData.no_telepon} 
                      onChange={e => setFormData({...formData, no_telepon: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editingId ? 'Simpan Perubahan' : 'Simpan Data Warga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Data Warga"
        message="Apakah Anda yakin ingin menghapus data warga ini? Seluruh data akun dan history tagihan akan ikut terhapus."
        confirmText="Ya, Hapus Sekarang"
      />
    </>
  );
}
