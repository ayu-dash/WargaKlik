'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Megaphone, Calendar, Plus, Edit, Trash2, Eye, EyeOff, Loader2, X, Check, Bell, AlertTriangle, Info, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils/format';

export default function PengumumanPage() {
  const { hasRole } = useAuth();
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target_role: 'semua',
    is_published: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPengurus = hasRole(['rt', 'wakil_rt', 'sekretaris', 'bendahara']);

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      const res = await api.get('/pengumuman');
      if (res.data.success) {
        setPengumuman(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', type: 'info', target_role: 'semua', is_published: true });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type || 'info',
      target_role: item.target_role || 'semua',
      is_published: item.is_published !== undefined ? item.is_published : true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/pengumuman/${editingId}`, formData);
        toast.success('Pengumuman berhasil diperbarui');
      } else {
        await api.post('/pengumuman', formData);
        toast.success('Pengumuman berhasil dibuat');
      }
      setIsModalOpen(false);
      fetchPengumuman();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengumuman');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await api.delete(`/pengumuman/${id}`);
      toast.success('Pengumuman berhasil dihapus');
      fetchPengumuman();
    } catch (err) {
      toast.error('Gagal menghapus pengumuman');
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'darurat': return <span className="inline-flex items-center gap-1 bg-red-100 text-danger px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200"><AlertTriangle className="w-3 h-3" /> DARURAT</span>;
      case 'penting': return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200"><Bell className="w-3 h-3" /> PENTING</span>;
      default: return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200"><Info className="w-3 h-3" /> INFORMASI</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-10 bg-slate-200 rounded-xl w-48 mb-6 animate-pulse"></div>
        {[1,2,3].map(i => (
          <div key={i} className="h-48 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-10 relative">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Papan <span className="text-primary">Pengumuman</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Informasi terkini untuk seluruh warga RT.</p>
        </div>

        {isPengurus && (
          <button 
            onClick={openCreateModal} 
            className="bg-primary text-white px-8 py-4 font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Tulis Pengumuman
          </button>
        )}
      </div>

      {pengumuman.length > 0 ? (
        <div className="grid gap-8">
          {pengumuman.map((item) => (
            <div key={item.id} className={`bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group transition-all hover:scale-[1.01]`}>
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                item.type === 'darurat' ? 'bg-danger' :
                item.type === 'penting' ? 'bg-amber-500' :
                'bg-primary'
              }`} />
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {getTypeBadge(item.type)}
                    {!item.is_published && (
                      <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">DRAFT</span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{item.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary/60" />
                      {formatDate(item.created_at)}
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary/60" />
                      Oleh: {item.author?.name || 'Pengurus RT'}
                    </span>
                  </div>
                </div>

                {isPengurus && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(item)}
                      className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-2xl">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-danger hover:bg-red-50 transition-all rounded-2xl">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-wrap bg-slate-50 p-8 rounded-[2rem] border border-slate-100/50">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-200 p-20 text-center rounded-[3rem] flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Megaphone className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Belum ada pengumuman</h3>
          <p className="text-slate-500 font-medium max-w-sm">Semua pengumuman penting dari pengurus RT akan muncul di sini untuk Anda.</p>
        </div>
      )}

      {/* Modal - Friendly Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 md:p-14 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
              <h3 className="font-bold text-3xl text-slate-900 tracking-tight flex items-center gap-4">
                <Megaphone className="w-10 h-10 text-primary" /> {editingId ? 'Edit Info' : 'Info Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">Judul Pengumuman</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-900 font-black text-xl outline-none focus:border-primary rounded-[1.5rem]"
                  placeholder="Tulis judul yang jelas..."
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">Isi Pengumuman</label>
                <textarea 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-6 text-slate-700 font-medium text-lg outline-none focus:border-primary rounded-[1.5rem] min-h-[200px]"
                  placeholder="Apa yang ingin disampaikan kepada warga?"
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Tingkat Kepentingan</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-900 font-bold outline-none focus:border-primary rounded-[1.2rem]"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="info">Informasi Umum</option>
                    <option value="penting">Sangat Penting</option>
                    <option value="darurat">Darurat / Mendesak</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Ditujukan Untuk</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-900 font-bold outline-none focus:border-primary rounded-[1.2rem]"
                    value={formData.target_role}
                    onChange={e => setFormData({...formData, target_role: e.target.value})}
                  >
                    <option value="semua">Semua Warga & Pengurus</option>
                    <option value="warga">Khusus Warga</option>
                    <option value="pengurus">Khusus Pengurus RT</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                <label className="relative flex items-center gap-4 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={formData.is_published}
                      onChange={e => setFormData({...formData, is_published: e.target.checked})} 
                    />
                    <div className="w-14 h-8 bg-slate-300 rounded-full peer-checked:bg-primary transition-all duration-300"></div>
                    <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full peer-checked:translate-x-6 transition-all duration-300 shadow-md"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 select-none flex items-center gap-2">
                    {formData.is_published ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    {formData.is_published ? 'Publikasikan Sekarang' : 'Simpan Sebagai Draft'}
                  </span>
                </label>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
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
                  {editingId ? 'Simpan Perubahan' : 'Sebarkan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
