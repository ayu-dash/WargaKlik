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
      <div className="glass-card p-12 text-center max-w-3xl mx-auto">
        <p className="text-slate-400">Data tidak ditemukan</p>
        <Link href="/dashboard/admin/warga" className="text-emerald-400 hover:underline mt-2 inline-block">← Kembali</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            Atur Iuran Warga
          </h1>
          <p className="text-slate-400 text-sm mt-1">Tentukan biaya iuran khusus per warga</p>
        </div>
      </div>

      {/* Warga Info */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <User className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{data.warga.kepala_keluarga}</h2>
          <p className="text-slate-400 text-sm flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Blok {data.warga.no_rumah}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-400">Total Iuran/Bulan</p>
          <p className={`text-lg font-bold ${totalEfektif !== totalMaster ? 'text-amber-400' : 'text-emerald-400'}`}>
            {formatRupiah(totalEfektif)}
          </p>
          {totalEfektif !== totalMaster && (
            <p className="text-xs text-slate-500 line-through">{formatRupiah(totalMaster)}</p>
          )}
        </div>
      </div>

      {/* Iuran Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
          <h3 className="font-semibold text-white text-sm">Daftar Iuran</h3>
          <p className="text-xs text-slate-400 mt-1">Kosongkan kolom "Nominal Khusus" untuk menggunakan tarif standar. Centang "Bebaskan" untuk mengecualikan warga dari iuran tersebut.</p>
        </div>

        <div className="divide-y divide-slate-700/50">
          {editItems.map((item, idx) => (
            <div key={item.iuran_master_id} className={`p-4 transition-colors ${item.has_custom ? 'bg-amber-500/5' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Nama Iuran */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{item.nama}</p>
                  <p className="text-xs text-slate-400 capitalize">{item.periode}</p>
                </div>

                {/* Tarif Standar */}
                <div className="text-sm text-center sm:w-32">
                  <p className="text-xs text-slate-500 mb-0.5">Standar</p>
                  <p className="text-slate-300 font-medium">{formatRupiah(item.nominal_master)}</p>
                </div>

                {/* Custom Nominal */}
                <div className="sm:w-40">
                  <p className="text-xs text-slate-500 mb-0.5">Nominal Khusus</p>
                  <input
                    type="number"
                    className={`input-field text-sm h-9 ${item.is_excluded ? 'opacity-40 cursor-not-allowed' : ''}`}
                    placeholder="Pakai standar"
                    value={item.nominal_custom ?? ''}
                    onChange={e => handleNominalChange(idx, e.target.value)}
                    disabled={item.is_excluded}
                  />
                </div>

                {/* Excluded checkbox */}
                <div className="flex items-center gap-2 sm:w-28">
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-red-500"
                      checked={item.is_excluded}
                      onChange={e => handleExcludedChange(idx, e.target.checked)}
                    />
                    <Ban className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-slate-400 text-xs">Bebaskan</span>
                  </label>
                </div>

                {/* Reset button */}
                <div className="sm:w-10 flex items-center justify-center">
                  {item.has_custom && (
                    <button onClick={() => handleReset(idx)}
                      className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors"
                      title="Reset ke standar">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Effective amount */}
                <div className="text-right sm:w-28">
                  <p className="text-xs text-slate-500 mb-0.5">Efektif</p>
                  <p className={`font-bold text-sm ${
                    item.is_excluded ? 'text-red-400 line-through' : 
                    item.has_custom ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {item.is_excluded ? formatRupiah(item.nominal_master) : formatRupiah(item.nominal_efektif)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary + Save */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-slate-400">Total Standar: </span>
              <span className="text-slate-300 font-medium">{formatRupiah(totalMaster)}</span>
            </div>
            <div>
              <span className="text-slate-400">Total Efektif: </span>
              <span className={`font-bold ${totalEfektif !== totalMaster ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatRupiah(totalEfektif)}
              </span>
            </div>
            {totalEfektif !== totalMaster && (
              <div className="text-xs text-amber-400/70">
                (Selisih: {formatRupiah(Math.abs(totalEfektif - totalMaster))})
              </div>
            )}
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
