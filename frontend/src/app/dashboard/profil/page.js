'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { User, Mail, Phone, Home, Lock, Save, Loader2, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProfilPage() {
  const { user, setUser } = useAuth();
  const [wargaData, setWargaData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile edit
  const [editData, setEditData] = useState({
    name: '',
    no_telepon: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setEditData({
          name: res.data.data.name || '',
          no_telepon: res.data.data.no_telepon || ''
        });
      }

      // Try to get warga data if user is warga
      if (user?.role === 'warga') {
        try {
          const wargaRes = await api.get('/warga');
          if (wargaRes.data.success && wargaRes.data.data.length > 0) {
            // Find warga linked to this user
            const myWarga = wargaRes.data.data.find(w => w.user_id === user.id);
            if (myWarga) setWargaData(myWarga);
          }
        } catch (e) {
          // Not critical
        }
      }
    } catch (err) {
      toast.error('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password berhasil diubah');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', editData);
      toast.success('Profil berhasil diperbarui');
      setUser(prev => ({ ...prev, ...editData }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-10 bg-slate-800/50 rounded-xl w-48 animate-pulse"></div>
        <div className="h-64 bg-slate-800/50 rounded-xl animate-pulse"></div>
        <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <User className="w-6 h-6 text-emerald-400" />
        Profil Saya
      </h1>

      {/* User Info Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input type="text" className="input-field pl-9" value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">No. WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-500" />
                </div>
                <input type="text" className="input-field pl-9" value={editData.no_telepon}
                  onChange={e => setEditData({...editData, no_telepon: e.target.value})} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <input type="email" className="input-field pl-9 opacity-60 cursor-not-allowed" 
                value={user?.email || ''} disabled />
            </div>
            <p className="text-xs text-slate-500 mt-1">Email tidak dapat diubah</p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* Warga Info (only for warga role) */}
      {wargaData && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-400" />
            Data Kependudukan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">No. Rumah</p>
              <p className="font-bold text-emerald-400">{wargaData.no_rumah}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Kepala Keluarga</p>
              <p className="font-medium text-white">{wargaData.kepala_keluarga}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">No. KK</p>
              <p className="font-medium text-white">{wargaData.no_kk || '-'}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Jumlah Anggota</p>
              <p className="font-medium text-white">{wargaData.jumlah_anggota} orang</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Status Rumah</p>
              <p className="font-medium text-white capitalize">{wargaData.status_rumah}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Status</p>
              <span className={`badge ${wargaData.is_active ? 'badge-success' : 'badge-danger'} px-2 py-0.5 text-xs`}>
                {wargaData.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Change Password */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          Ubah Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password Saat Ini</label>
            <input type="password" required className="input-field" placeholder="••••••••"
              value={passwords.currentPassword}
              onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password Baru</label>
              <input type="password" required className="input-field" placeholder="Min. 6 karakter"
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Konfirmasi Password Baru</label>
              <input type="password" required className="input-field" placeholder="Ulangi password baru"
                value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={changingPassword} className="btn-primary flex items-center gap-2">
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Ubah Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
