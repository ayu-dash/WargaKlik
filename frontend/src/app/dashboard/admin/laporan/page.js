'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus, CheckCircle, Download, FileCheck, Loader2, X, Check, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBulanName, formatDateTime } from '@/utils/format';

export default function AdminLaporan() {
  const { hasRole } = useAuth();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      toast.success('Laporan berhasil dibuat');
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
    <div className="space-y-10 animate-fade-in relative pb-10 font-sans max-w-6xl mx-auto">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Laporan <span className="text-primary">Keuangan RT</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Arsip resmi pertanggungjawaban kas warga.</p>
        </div>

        {hasRole(['sekretaris', 'bendahara', 'rt', 'wakil_rt']) && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-8 py-4 font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Buat Laporan Baru
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <div className="text-slate-500 font-bold">Mengambil arsip laporan...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {laporan.length > 0 ? (
            laporan.map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${item.status === 'approved' ? 'bg-emerald-50 text-primary' : (item.jenis === 'tunggakan' ? 'bg-red-50 text-danger' : 'bg-amber-50 text-amber-600')}`}>
                        {item.status === 'approved' ? (
                          <FileCheck className="w-8 h-8" />
                        ) : (
                          <FileText className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                          {item.jenis === 'bulanan' ? 'Laporan Bulanan' : (item.jenis === 'tahunan' ? 'Laporan Tahunan' : 'Laporan Tunggakan')}
                        </h3>
                        <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                          {(item.jenis === 'bulanan' || item.jenis === 'tunggakan') ? `${getBulanName(item.bulan)} ${item.tahun}` : `Periode ${item.tahun}`}
                        </p>
                      </div>
                    </div>
                    {item.status === 'approved' ? (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Resmi</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Draft</span>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl space-y-3 mb-8 border border-slate-100">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                       <Calendar className="w-4 h-4 text-slate-400" />
                       Dibuat: {formatDateTime(item.created_at)}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                       <CheckCircle className="w-4 h-4 text-slate-400" />
                       Oleh: {item.pembuat?.name}
                    </div>
                    {item.status === 'approved' && (
                      <div className="flex items-center gap-3 text-sm font-bold text-primary">
                         <FileCheck className="w-4 h-4" />
                         Disetujui: {item.penyetuju?.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  {item.file_url ? (
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.file_url}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 bg-white border-2 border-slate-100 py-4 rounded-2xl flex items-center justify-center gap-3 text-slate-700 font-bold hover:bg-slate-50 hover:border-primary/20 hover:text-primary transition-all text-sm"
                    >
                      <Download className="w-5 h-5" /> Unduh Laporan (PDF)
                    </a>
                  ) : (
                    <button disabled className="flex-1 bg-slate-50 text-slate-300 py-4 rounded-2xl font-bold cursor-not-allowed text-sm flex items-center justify-center gap-2">
                       <Loader2 className="w-4 h-4" /> Sedang Diproses...
                    </button>
                  )}

                  {item.status === 'draft' && hasRole(['rt', 'wakil_rt']) && (
                    <button 
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                    >
                      <CheckCircle className="w-5 h-5" /> Setujui
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
              <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <div className="text-lg font-bold text-slate-400">Belum ada dokumen laporan untuk periode ini.</div>
            </div>
          )}
        </div>
      )}

      {/* Modal - Friendly Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 md:p-14 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
              <h3 className="font-bold text-3xl text-slate-900 tracking-tight flex items-center gap-4">
                <FileText className="w-8 h-8 text-primary" /> Buat Laporan
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 ml-1">Jenis Laporan Keuangan</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-5 text-slate-900 font-bold text-lg outline-none focus:border-primary rounded-2xl"
                  value={formData.jenis} 
                  onChange={e => setFormData({...formData, jenis: e.target.value})}
                >
                  <option value="bulanan">Laporan Kas Bulanan</option>
                  <option value="tahunan">Laporan Kas Tahunan</option>
                  <option value="tunggakan">Laporan Tunggakan Warga</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(formData.jenis === 'bulanan' || formData.jenis === 'tunggakan') && (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 ml-1">Bulan Periode</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-700 font-semibold outline-none focus:border-primary rounded-2xl"
                      value={formData.bulan} 
                      onChange={e => setFormData({...formData, bulan: e.target.value})}
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1}>{getBulanName(i+1)}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={`${formData.jenis === 'tahunan' ? 'col-span-2' : ''} space-y-3`}>
                  <label className="block text-sm font-bold text-slate-700 ml-1">Tahun Periode</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-slate-700 font-semibold outline-none focus:border-primary rounded-2xl"
                    min="2020" max="2100"
                    value={formData.tahun} 
                    onChange={e => setFormData({...formData, tahun: e.target.value})} 
                  />
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
                 <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                 <p className="text-sm font-medium text-slate-600 leading-relaxed">
                   Sistem akan menghitung otomatis saldo kas, total iuran masuk, dan pengeluaran operasional berdasarkan periode yang dipilih.
                 </p>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-primary text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : <ChevronRight className="w-7 h-7" />}
                  Mulai Generate Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
