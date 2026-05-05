'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { 
  Receipt, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Loader2,
  CalendarDays,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { formatRupiah, getBulanName, formatDateTime } from '@/utils/format';
import { toast } from 'react-hot-toast';

export default function TagihanDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [tagihan, setTagihan] = useState(null);
  const [pembayaran, setPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tagihanRes, pembayaranRes] = await Promise.all([
        api.get(`/tagihan/${id}`),
        api.get(`/pembayaran?tagihan_id=${id}`) // We implemented get all with tagihan logic if warga
      ]);
      
      if (tagihanRes.data.success) {
        setTagihan(tagihanRes.data.data);
      }
      
      if (pembayaranRes.data.success) {
        // filter by this tagihan
        const history = pembayaranRes.data.data.filter(p => p.tagihan_id == id);
        setPembayaran(history);
      }
    } catch (err) {
      toast.error('Gagal mengambil data tagihan');
      console.error(err);
      router.push('/dashboard/tagihan');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setIsPaying(true);
    try {
      const res = await api.post('/pembayaran/midtrans/snap', {
        tagihan_id: tagihan.id
      });
      
      if (res.data.success) {
        const snapToken = res.data.data.token;
        
        window.snap.pay(snapToken, {
          onSuccess: function(result) {
            toast.success('Pembayaran berhasil!');
            fetchData();
          },
          onPending: function(result) {
            toast.success('Menunggu pembayaran!');
            fetchData();
          },
          onError: function(result) {
            toast.error('Pembayaran gagal!');
            setIsPaying(false);
          },
          onClose: function() {
            toast.error('Anda menutup popup tanpa menyelesaikan pembayaran');
            setIsPaying(false);
          }
        });
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memproses pembayaran');
      setIsPaying(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>;
  }

  if (!tagihan) return null;

  const isLunas = tagihan.status === 'lunas';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tagihan" className="p-2 glass rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Detail Tagihan</h1>
          <p className="text-slate-400 text-sm mt-1">
            Bulan {getBulanName(tagihan.bulan)} {tagihan.tahun}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                  <Receipt className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Iuran Bulanan RT</h2>
                  <p className="text-sm text-slate-400">Tagihan No: TGH-{tagihan.id.toString().padStart(5, '0')}</p>
                </div>
              </div>
              <div>
                {isLunas ? (
                  <span className="badge badge-success px-3 py-1 text-sm"><CheckCircle2 className="w-4 h-4 mr-1"/> Lunas</span>
                ) : (
                  <span className="badge badge-danger px-3 py-1 text-sm"><AlertCircle className="w-4 h-4 mr-1"/> Belum Lunas</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Rincian Iuran</h3>
              
              <div className="space-y-4">
                {tagihan.items && tagihan.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-300">
                    <span>{item.nama_iuran}</span>
                    <span className="font-medium">{formatRupiah(item.nominal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-800 border-dashed mt-6 pt-6 flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total Tagihan</span>
                <span className="text-2xl font-bold text-emerald-400">{formatRupiah(tagihan.total_nominal)}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Riwayat Pembayaran
            </h3>
            
            {pembayaran.length > 0 ? (
              <div className="space-y-4">
                {pembayaran.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{formatRupiah(p.jumlah_bayar)}</span>
                        {p.status === 'success' && <span className="badge badge-success text-[10px] px-2 py-0.5">Berhasil</span>}
                        {p.status === 'pending' && <span className="badge badge-warning text-[10px] px-2 py-0.5">Pending</span>}
                        {p.status === 'failed' || p.status === 'expired' && <span className="badge badge-danger text-[10px] px-2 py-0.5">Gagal</span>}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{formatDateTime(p.tanggal_bayar)}</span>
                        <span>•</span>
                        <span className="uppercase">{p.metode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada riwayat pembayaran untuk tagihan ini.</p>
            )}
          </div>
        </div>

        {/* Sidebar Info & Actions */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Informasi Jatuh Tempo</h3>
            <div className="flex items-center gap-3 text-slate-300">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              <span className="font-medium">10 {getBulanName(tagihan.bulan)} {tagihan.tahun}</span>
            </div>
          </div>

          {!isLunas && (
            <div className="glass-card p-6 border-emerald-500/30">
              <h3 className="text-lg font-semibold text-white mb-4">Pembayaran</h3>
              <p className="text-sm text-slate-400 mb-6">
                Lakukan pembayaran secara online dan instan melalui berbagai metode pembayaran yang tersedia.
              </p>
              
              <button 
                onClick={handlePay}
                disabled={isPaying}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {isPaying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Bayar Sekarang
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
