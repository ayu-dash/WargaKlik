'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { FileText, Download, FileCheck, Loader2 } from 'lucide-react';
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
      // Backend automatically filters only 'approved' reports for warga
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-400" />
          Laporan Transparansi Keuangan
        </h1>
        <p className="text-slate-400 text-sm mt-1">Laporan pertanggungjawaban keuangan RT yang telah disetujui</p>
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
                  <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
                    <FileCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Laporan {item.jenis === 'bulanan' ? 'Bulanan' : 'Tahunan'}</h3>
                    <p className="text-sm text-slate-400">
                      {item.jenis === 'bulanan' ? `${getBulanName(item.bulan)} ${item.tahun}` : `Tahun ${item.tahun}`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-slate-400 mb-4 space-y-1">
                <p>Tanggal Terbit: {formatDateTime(item.disetujui_at)}</p>
                <p className="text-emerald-400">Disetujui oleh: {item.penyetuju?.name}</p>
              </div>

              <div className="pt-4 border-t border-slate-700/50 mt-auto">
                {item.file_url ? (
                  <a 
                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.file_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full btn-secondary py-2 flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" /> Unduh Laporan (PDF)
                  </a>
                ) : (
                  <button disabled className="w-full btn-secondary py-2 opacity-50 cursor-not-allowed text-sm">
                    PDF Belum Tersedia
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {laporan.length === 0 && (
            <div className="col-span-full glass-card p-12 text-center text-slate-400">
              Belum ada laporan keuangan yang diterbitkan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
