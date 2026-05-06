'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { FileText, Download, FileCheck, Loader2, ShieldCheck, Calendar, ArrowRight, UserCheck, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBulanName, formatDateTime } from '@/utils/format';

export default function WargaLaporan() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-10 animate-fade-in relative pb-10 font-sans max-w-5xl mx-auto">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Transparansi <span className="text-primary">Keuangan RT</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Laporan resmi pertanggungjawaban dana iuran warga.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <div className="text-slate-500 font-bold">Mengunduh daftar laporan...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {laporan.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between group hover:border-primary/20 hover:scale-[1.02] transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm">
                    <FileCheck className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      Laporan {item.jenis === 'bulanan' ? 'Bulanan' : 'Tahunan'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-primary/60" />
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        {item.jenis === 'bulanan' ? `${getBulanName(item.bulan)} ${item.tahun}` : `Tahun ${item.tahun}`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <Clock className="w-4 h-4 text-primary/40" />
                    <span>Terbit: {formatDateTime(item.disetujui_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-900">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>Disahkan oleh: {item.penyetuju?.name}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 mt-auto">
                {item.file_url ? (
                  <a 
                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.file_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg"
                  >
                    <Download className="w-5 h-5 text-primary" /> Unduh Laporan (PDF)
                  </a>
                ) : (
                  <div className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                    Berkas Sedang Diproses
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {laporan.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
              <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <div className="text-lg font-bold text-slate-400">Belum ada laporan resmi yang diterbitkan.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
