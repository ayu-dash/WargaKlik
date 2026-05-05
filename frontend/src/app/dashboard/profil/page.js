'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { User, Mail, Phone, Home, Lock, Save, Loader2, CheckCircle, Shield, AlertCircle, PhoneCall, MapPin, CreditCard } from 'lucide-react';
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

      if (user?.role === 'warga') {
        try {
          const wargaRes = await api.get('/warga');
          if (wargaRes.data.success && wargaRes.data.data.length > 0) {
            const myWarga = wargaRes.data.data.find(w => w.user_id === user.id);
            if (myWarga) setWargaData(myWarga);
          }
        } catch (e) {}
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-10 bg-slate-200 rounded-xl w-48 animate-pulse"></div>
        <div className="h-64 bg-white rounded-[2.5rem] animate-pulse"></div>
        <div className="h-48 bg-white rounded-[2.5rem] animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-10 relative">
      <div className="fixed inset-0 community-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Pengaturan <span className="text-primary">Profil Saya</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Kelola informasi pribadi dan keamanan akun Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column - Main Profile Info */}
        <div className="lg:col-span-7 space-y-10">
          {/* User Info Card */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-50">
              <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 border-4 border-white shadow-xl flex items-center justify-center relative">
                <User className="w-12 h-12 text-primary" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                   <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">
                   {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 py-5 pl-14 pr-6 text-slate-900 font-bold text-lg focus:border-primary transition-all rounded-2xl outline-none"
                      value={editData.name}
                      onChange={e => setEditData({...editData, name: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <PhoneCall className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 py-5 pl-14 pr-6 text-slate-900 font-bold text-lg focus:border-primary transition-all rounded-2xl outline-none"
                      value={editData.no_telepon}
                      onChange={e => setEditData({...editData, no_telepon: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
                  <div className="relative opacity-60">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="email" 
                      className="w-full bg-slate-100 border border-slate-200 py-5 pl-14 pr-6 text-slate-500 font-bold text-lg rounded-2xl cursor-not-allowed" 
                      value={user?.email || ''} 
                      disabled 
                    />
                  </div>
                  <p className="text-xs text-slate-400 font-medium ml-1">Email adalah identitas masuk dan tidak dapat diubah.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={savingProfile} 
                  className="bg-primary text-white px-10 py-4.5 font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                >
                  {savingProfile ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
              <Lock className="w-7 h-7 text-primary" /> Ubah Kata Sandi
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi Saat Ini</label>
                <input 
                  type="password" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 py-5 px-6 text-slate-900 font-bold text-lg focus:border-primary transition-all rounded-2xl outline-none" 
                  placeholder="••••••••"
                  value={passwords.currentPassword}
                  onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 py-5 px-6 text-slate-900 font-bold text-lg focus:border-primary transition-all rounded-2xl outline-none" 
                    placeholder="Min. 6 karakter"
                    value={passwords.newPassword}
                    onChange={e => setPasswords({...passwords, newPassword: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Ulangi Sandi Baru</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 py-5 px-6 text-slate-900 font-bold text-lg focus:border-primary transition-all rounded-2xl outline-none" 
                    placeholder="Konfirmasi"
                    value={passwords.confirmPassword}
                    onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} 
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={changingPassword} 
                  className="bg-slate-900 text-white px-10 py-4.5 font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-3"
                >
                  {changingPassword ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                  Ubah Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Secondary Info */}
        <div className="lg:col-span-5 space-y-10">
          {/* Warga Info (only for warga role) */}
          {wargaData && (
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl shadow-slate-900/40 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-white/10 rounded-[1.2rem] flex items-center justify-center">
                   <Home className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-black tracking-tight leading-tight">Data Kependudukan <br /> Lingkungan RT</h3>
                <p className="text-slate-400 font-medium">Informasi resmi rumah Anda yang terdaftar di sistem warga.</p>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-6">
                {[
                  { icon: MapPin, label: 'Nomor Rumah', value: wargaData.no_rumah, color: 'text-primary' },
                  { icon: User, label: 'Kepala Keluarga', value: wargaData.kepala_keluarga, color: 'text-blue-400' },
                  { icon: CreditCard, label: 'Status Rumah', value: wargaData.status_rumah, color: 'text-amber-400', isCaps: true },
                  { icon: Shield, label: 'Status Keanggotaan', value: wargaData.is_active ? 'Aktif' : 'Nonaktif', color: 'text-emerald-400' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem] flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                       <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                       <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{item.label}</div>
                       <div className={`text-lg font-black text-white ${item.isCaps ? 'capitalize' : ''}`}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 p-6 bg-primary/10 rounded-[1.5rem] border border-primary/20 flex gap-4">
                 <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                 <p className="text-xs font-medium text-slate-300 leading-relaxed">
                   Jika ada kesalahan data kependudukan, silakan hubungi Pengurus RT untuk pembaruan data resmi.
                 </p>
              </div>
            </div>
          )}

          {/* Help Card */}
          <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3rem] space-y-6">
             <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-primary" />
             </div>
             <h4 className="text-xl font-black text-slate-900 tracking-tight">Butuh Bantuan?</h4>
             <p className="text-slate-600 font-medium leading-relaxed">
               Jika Anda mengalami kesulitan dalam mengakses akun atau menemukan kendala pada sistem, jangan ragu untuk menghubungi admin.
             </p>
             <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black shadow-sm hover:shadow-md transition-all">
                Hubungi Admin RT
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
