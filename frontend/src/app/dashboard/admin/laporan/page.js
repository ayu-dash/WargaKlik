'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus, CheckCircle, Download, FileCheck, Loader2, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBulanName, formatDateTime } from '@/utils/format';

export default function AdminLaporan() {
  const { hasRole } = useAuth();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Generate
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    jenis: 'bulanan',
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/laporan');
      if (res.data.success) {
        setLaporan(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/laporan/generate', formData);
      toast.success('Laporan berhasil digenerate');
      setIsModalOpen(false);
      fetchLaporan();
    } catch (err) {
      toast.error(err.message || 'Gagal generate laporan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/laporan/${id}/approve`);
      toast.success('Laporan disetujui');
      fetchLaporan();
    } catch (err) {
      toast.error('Gagal menyetujui laporan');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Laporan Keuangan
          </h1>
          <p className="text-slate-400 text-sm mt-1">Kelola dan unduh laporan pertanggungjawaban RT</p>
        </div>

        {hasRole(['sekretaris', 'bendahara', 'rt', 'wakil_rt']) && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 py-2.5 px-4"
          >
            <Plus className="w-4 h-4" />
            Buat Laporan Baru
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass-card p-6 h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {laporan.map((item) => (
            <div key={item.id} className="glass-card p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${item.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                    {item.status === 'approved' ? (
                      <FileCheck className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <FileText className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Laporan {item.jenis === 'bulanan' ? 'Bulanan' : 'Tahunan'}</h3>
                    <p className="text-sm text-slate-400">
                      {item.jenis === 'bulanan' ? `${getBulanName(item.bulan)} ${item.tahun}` : `Tahun ${item.tahun}`}
                    </p>
                  </div>
                </div>
                {item.status === 'approved' ? (
                  <span className="badge badge-success px-2 py-1 text-xs">Disetujui</span>
                ) : (
                  <span className="badge badge-warning px-2 py-1 text-xs">Draft</span>
                )}
              </div>
              
              <div className="text-xs text-slate-400 mb-4 space-y-1">
                <p>Dibuat oleh: {item.pembuat?.name}</p>
                <p>Tanggal: {formatDateTime(item.created_at)}</p>
                {item.status === 'approved' && (
                  <p className="text-emerald-400">Disetujui oleh: {item.penyetuju?.name}</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-700/50 mt-auto flex gap-2">
                {item.file_url ? (
                  <a 
                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.file_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 btn-secondary py-2 flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" /> Unduh PDF
                  </a>
                ) : (
                  <button disabled className="flex-1 btn-secondary py-2 opacity-50 cursor-not-allowed text-sm">
                    PDF Belum Tersedia
                  </button>
                )}

                {item.status === 'draft' && hasRole(['rt', 'wakil_rt']) && (
                  <button 
                    onClick={() => handleApprove(item.id)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg py-2 flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Setujui
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {laporan.length === 0 && (
            <div className="col-span-full glass-card p-12 text-center text-slate-400">
              Belum ada data laporan keuangan.
            </div>
          )}
        </div>
      )}

      {/* Modal Buat Laporan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Buat Laporan Baru
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jenis Laporan</label>
                <select className="input-field" value={formData.jenis} onChange={e => setFormData({...formData, jenis: e.target.value})}>
                  <option value="bulanan">Bulanan</option>
                  <option value="tahunan">Tahunan</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {formData.jenis === 'bulanan' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bulan</label>
                    <select className="input-field" value={formData.bulan} onChange={e => setFormData({...formData, bulan: e.target.value})}>
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1}>{getBulanName(i+1)}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={formData.jenis === 'tahunan' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tahun</label>
                  <input type="number" required className="input-field" min="2020" max="2100"
                    value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
