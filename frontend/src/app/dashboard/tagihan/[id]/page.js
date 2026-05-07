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
        tagihan_ids: [tagihan.id]
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
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-fade-in pb-10 relative px-4 sm:px-0">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      <div className="flex items-center gap-4 border-b border-slate-200 pb-6 md:pb-8">
        <Link href="/dashboard/tagihan" className="p-2.5 md:p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Detail <span className="text-primary">Tagihan</span></h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Periode {getBulanName(tagihan.bulan)} {tagihan.tahun}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Main Info */}
        <div className="lg:col-span-8 space-y-6 md:space-y-10">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.2rem] bg-emerald-50 flex items-center justify-center border border-emerald-100/50 shadow-sm">
                  <Receipt className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">Iuran Bulanan RT</h2>
                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">NO: TGH-{tagihan.id.toString().padStart(5, '0')}</p>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                {isLunas ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5"/> Lunas</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-danger px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100"><AlertCircle className="w-3.5 h-3.5"/> Belum Lunas</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 ml-1">Rincian Iuran</h3>
              
              <div className="space-y-4 md:space-y-5">
                {tagihan.items && tagihan.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-600 group">
                    <span className="font-bold text-sm md:text-base group-hover:text-slate-900 transition-colors">{item.keterangan}</span>
                    <span className="font-black text-sm md:text-base text-slate-900">{formatRupiah(item.nominal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 border-dashed mt-8 pt-8 flex justify-between items-center">
                <span className="text-base md:text-lg font-black text-slate-900">Total Tagihan</span>
                <span className="text-xl md:text-2xl font-black text-primary">{formatRupiah(tagihan.total_nominal)}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 md:mb-8 flex items-center gap-3 tracking-tight">
              <FileText className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              Riwayat Pembayaran
            </h3>
            
            {pembayaran.length > 0 ? (
              <div className="grid gap-4">
                {pembayaran.map((p) => (
                  <div key={p.id} className="p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 text-base md:text-lg">{formatRupiah(p.jumlah_bayar)}</span>
                        {p.status === 'success' && <span className="bg-emerald-100 text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Berhasil</span>}
                        {p.status === 'pending' && <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Pending</span>}
                        {(p.status === 'failed' || p.status === 'expired') && <span className="bg-red-100 text-danger text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Gagal</span>}
                      </div>
                      <div className="text-[10px] md:text-xs font-bold text-slate-400 flex items-center gap-2">
                        <span>{formatDateTime(p.tanggal_bayar)}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="uppercase">{p.metode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200">
                <p className="text-xs md:text-sm text-slate-400 font-bold">Belum ada riwayat pembayaran untuk tagihan ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info & Actions */}
        <div className="lg:col-span-4 space-y-6 md:space-y-10">
          <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 space-y-4 md:space-y-6">
              <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Jatuh Tempo</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                  <CalendarDays className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <span className="text-lg md:text-xl font-black tracking-tight leading-tight">10 {getBulanName(tagihan.bulan)}<br />{tagihan.tahun}</span>
              </div>
            </div>
          </div>

          {!isLunas && (
            <div className="bg-emerald-50 border border-emerald-100 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-8">
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Pembayaran Online</h3>
                <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                  Lakukan pembayaran secara instan melalui berbagai metode yang tersedia (QRIS, Bank, dll).
                </p>
              </div>
              
              <button 
                onClick={handlePay}
                disabled={isPaying}
                className="w-full bg-primary text-white py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-base md:text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {isPaying ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
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
