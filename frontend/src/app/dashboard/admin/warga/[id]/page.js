'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { ArrowLeft, User, Home, Save, Loader2, RotateCcw, Ban, Receipt } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatRupiah } from '@/utils/format';
import Link from 'next/link';

export default function WargaIuranPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editItems, setEditItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/warga-iuran/${id}`);
      if (res.data.success) {
        setData(res.data.data);
        setEditItems(res.data.data.iuran.map(i => ({
          iuran_master_id: i.iuran_master_id,
          nama: i.nama,
          nominal_master: i.nominal_master,
          periode: i.periode,
          nominal_custom: i.nominal_custom,
          is_excluded: i.is_excluded,
          nominal_efektif: i.nominal_efektif,
          has_custom: i.has_custom
        })));
      }
    } catch (err) {
      toast.error('Gagal memuat data iuran warga');
    } finally {
      setLoading(false);
    }
  };

  const handleNominalChange = (index, value) => {
    setEditItems(prev => {
      const updated = [...prev];
      const numVal = value === '' ? null : parseFloat(value);
      updated[index] = {
        ...updated[index],
        nominal_custom: numVal,
        nominal_efektif: updated[index].is_excluded ? 0 : (numVal !== null ? numVal : updated[index].nominal_master),
        has_custom: numVal !== null || updated[index].is_excluded
      };
      return updated;
    });
  };

  const handleExcludedChange = (index, checked) => {
    setEditItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        is_excluded: checked,
        nominal_efektif: checked ? 0 : (updated[index].nominal_custom !== null ? updated[index].nominal_custom : updated[index].nominal_master),
        has_custom: checked || updated[index].nominal_custom !== null
      };
      return updated;
    });
  };

  const handleReset = (index) => {
    setEditItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        nominal_custom: null,
        is_excluded: false,
        nominal_efektif: updated[index].nominal_master,
        has_custom: false
      };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = editItems.map(i => ({
        iuran_master_id: i.iuran_master_id,
        nominal_custom: i.nominal_custom,
        is_excluded: i.is_excluded
      }));

      await api.put(`/warga-iuran/${id}`, { items });
      toast.success('Pengaturan iuran warga berhasil disimpan');
      fetchData(); // refresh
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const totalEfektif = editItems.reduce((sum, i) => sum + (i.nominal_efektif || 0), 0);
  const totalMaster = editItems.reduce((sum, i) => sum + i.nominal_master, 0);
  const hasChanges = editItems.some(i => i.has_custom);

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-10 bg-slate-800/50 rounded-xl w-64 animate-pulse"></div>
        <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse"></div>
        <div className="h-64 bg-slate-800/50 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-12 text-center max-w-3xl mx-auto border border-slate-100 rounded-2xl">
        <p className="text-slate-400">Data tidak ditemukan</p>
        <Link href="/dashboard/admin/warga" className="text-primary hover:underline mt-2 inline-block">← Kembali</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-fade-in pb-10 relative px-4 sm:px-0">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6 md:pb-8">
        <button onClick={() => router.back()} className="p-2.5 md:p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 md:gap-3">
            <Receipt className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Atur <span className="text-primary">Iuran Warga</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Tentukan biaya iuran khusus per warga</p>
        </div>
      </div>

      {/* Warga Info */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <User className="w-7 h-7 md:w-8 md:h-8 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{data.warga.kepala_keluarga}</h2>
          <p className="text-slate-500 text-sm md:text-base font-bold flex items-center gap-1.5">
            <Home className="w-4 h-4 text-primary" /> Blok {data.warga.no_rumah}
          </p>
        </div>
        <div className="w-full md:w-auto md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl border border-slate-100 md:border-none">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Iuran/Bulan</p>
          <p className={`text-xl md:text-3xl font-black leading-tight ${totalEfektif !== totalMaster ? 'text-amber-500' : 'text-primary'}`}>
            {formatRupiah(totalEfektif)}
          </p>
          {totalEfektif !== totalMaster && (
            <p className="text-xs md:text-sm font-bold text-slate-400 line-through mt-0.5">{formatRupiah(totalMaster)}</p>
          )}
        </div>
      </div>

      {/* Iuran List */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-black text-slate-900 text-base md:text-lg tracking-tight">Daftar Komponen Iuran</h3>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Sesuaikan nominal atau bebaskan iuran tertentu untuk warga ini.</p>
        </div>

        <div className="divide-y divide-slate-100">
          {editItems.map((item, idx) => (
            <div key={item.iuran_master_id} className={`p-6 md:p-8 transition-colors ${item.has_custom ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Nama Iuran */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-slate-900 text-lg md:text-xl leading-tight">{item.nama}</p>
                    {item.has_custom && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Custom</span>}
                  </div>
                  <p className="text-xs md:text-sm font-bold text-slate-400 capitalize flex items-center gap-1.5">
                    <RotateCcw className="w-3 h-3" /> Periode {item.periode}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-6 md:gap-8">
                  {/* Tarif Standar */}
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Standar</p>
                    <p className="text-slate-600 font-bold text-sm md:text-base">{formatRupiah(item.nominal_master)}</p>
                  </div>

                  {/* Custom Nominal Input */}
                  <div className="space-y-1 min-w-[140px]">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal Khusus</p>
                    <div className="relative">
                      <input
                        type="number"
                        className={`w-full bg-slate-50 border border-slate-200 py-2 px-3 text-slate-900 font-bold text-sm rounded-lg outline-none focus:border-primary transition-all ${item.is_excluded ? 'opacity-40 cursor-not-allowed bg-slate-100' : ''}`}
                        placeholder="Standar"
                        value={item.nominal_custom ?? ''}
                        onChange={e => handleNominalChange(idx, e.target.value)}
                        disabled={item.is_excluded}
                      />
                    </div>
                  </div>

                  {/* Excluded checkbox */}
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={item.is_excluded}
                          onChange={e => handleExcludedChange(idx, e.target.checked)}
                        />
                        <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-red-500 transition-all"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-all shadow-sm"></div>
                      </div>
                      <span className={`text-xs font-black uppercase tracking-widest ${item.is_excluded ? 'text-red-500' : 'text-slate-400'}`}>Bebas</span>
                    </label>
                  </div>

                  {/* Effective amount */}
                  <div className="space-y-1 text-right sm:text-left lg:text-right min-w-[100px]">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Efektif</p>
                    <p className={`font-black text-base md:text-lg tracking-tight ${
                      item.is_excluded ? 'text-red-400 line-through opacity-50' : 
                      item.has_custom ? 'text-amber-500' : 'text-primary'
                    }`}>
                      {item.is_excluded ? formatRupiah(item.nominal_master) : formatRupiah(item.nominal_efektif)}
                    </p>
                  </div>
                </div>

                {/* Reset Action */}
                {item.has_custom && (
                  <button onClick={() => handleReset(idx)}
                    className="p-3 text-slate-400 hover:text-amber-600 bg-amber-50 lg:bg-transparent rounded-xl transition-all self-end lg:self-center"
                    title="Reset ke standar">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary + Save */}
        <div className="p-8 md:p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 text-center md:text-left">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Standar</p>
              <p className="text-slate-500 font-bold text-base md:text-lg">{formatRupiah(totalMaster)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Efektif</p>
              <p className={`text-xl md:text-2xl font-black tracking-tight ${totalEfektif !== totalMaster ? 'text-amber-500' : 'text-primary'}`}>
                {formatRupiah(totalEfektif)}
              </p>
            </div>
            {totalEfektif !== totalMaster && (
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Selisih: {formatRupiah(Math.abs(totalEfektif - totalMaster))}
              </div>
            )}
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="w-full md:w-auto bg-primary text-white px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
