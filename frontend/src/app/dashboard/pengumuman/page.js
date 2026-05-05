'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Megaphone, Calendar, Plus, Edit, Trash2, Eye, EyeOff, Loader2, X, Check } from 'lucide-react';
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
      case 'darurat': return <span className="badge badge-danger px-2 py-0.5 text-[10px]">DARURAT</span>;
      case 'penting': return <span className="badge badge-warning px-2 py-0.5 text-[10px]">PENTING</span>;
      default: return <span className="badge badge-info px-2 py-0.5 text-[10px]">INFO</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-10 bg-slate-800/50 rounded-xl w-48 mb-6 animate-pulse"></div>
        {[1,2,3].map(i => (
          <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-emerald-400" />
          Pengumuman RT
        </h1>

        {isPengurus && (
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 py-2.5 px-4">
            <Plus className="w-4 h-4" />
            Buat Pengumuman
          </button>
        )}
      </div>

      {pengumuman.length > 0 ? (
        <div className="grid gap-6">
          {pengumuman.map((item) => (
            <div key={item.id} className={`glass-card p-6 border-l-4 ${
              item.type === 'darurat' ? 'border-l-red-500' :
              item.type === 'penting' ? 'border-l-amber-500' :
              'border-l-emerald-500'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">{item.title}</h2>
                    {getTypeBadge(item.type)}
                    {!item.is_published && (
                      <span className="badge bg-slate-700 text-slate-300 px-2 py-0.5 text-[10px]">DRAFT</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(item.created_at)}
                    </span>
                    <span>•</span>
                    <span className="capitalize px-2 py-0.5 bg-slate-800 rounded-md">
                      Dari: {item.author?.name || 'Pengurus RT'}
                    </span>
                  </div>
                </div>

                {isPengurus && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(item)}
                      className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded hover:bg-blue-500/10">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Belum ada pengumuman</h3>
          <p className="text-slate-400">Pengumuman dari pengurus RT akan tampil di sini.</p>
        </div>
      )}

      {/* Modal Create/Edit Pengumuman */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-400" />
                {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="pengumumanForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Judul</label>
                  <input type="text" required className="input-field" placeholder="Judul pengumuman"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Isi Pengumuman</label>
                  <textarea required className="input-field min-h-[120px] resize-y" placeholder="Tulis isi pengumuman..."
                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Tipe</label>
                    <select className="input-field" value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="info">Info</option>
                      <option value="penting">Penting</option>
                      <option value="darurat">Darurat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Target</label>
                    <select className="input-field" value={formData.target_role}
                      onChange={e => setFormData({...formData, target_role: e.target.value})}>
                      <option value="semua">Semua</option>
                      <option value="warga">Warga Saja</option>
                      <option value="pengurus">Pengurus Saja</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-emerald-500"
                      checked={formData.is_published}
                      onChange={e => setFormData({...formData, is_published: e.target.checked})} />
                    <span className="text-sm text-slate-300 flex items-center gap-1">
                      {formData.is_published ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                      {formData.is_published ? 'Langsung dipublikasikan' : 'Simpan sebagai draft'}
                    </span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                Batal
              </button>
              <button type="submit" form="pengumumanForm" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingId ? 'Perbarui' : 'Publikasikan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
