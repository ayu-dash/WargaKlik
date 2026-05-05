'use client';

import Link from 'next/link';
import {
  Receipt,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  ChevronRight,
  Heart,
  Smile,
  Shield
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20 selection:text-primary overflow-x-hidden font-sans">
      <div className="fixed inset-0 community-grid opacity-40 pointer-events-none -z-10" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="WargaKlik Logo" className="h-20 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#fitur" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors">Cara Kerja</a>
            <a href="#transparansi" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors">Keamanan</a>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-sm font-bold text-primary">
            <Heart className="w-4 h-4 fill-primary" />
            Portal Iuran Warga Digital
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Kelola Iuran RT Jadi <br />
            <span className="text-primary">Lebih Mudah & Jujur</span>
          </h1>

          <p className="text-text-muted text-xl max-w-2xl mx-auto leading-relaxed">
            Membantu pengurus RT mengelola keuangan secara transparan,
            dan memudahkan warga membayar iuran tanpa harus keluar rumah.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="group bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Mulai Gunakan Sekarang <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#fitur"
              className="px-10 py-5 bg-white border border-border text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-50 transition-all text-center"
            >
              Lihat Caranya
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-12 pt-12">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-slate-900">Terbuka</div>
              <div className="text-sm font-medium text-text-muted mt-1 uppercase tracking-wide">Semua Bisa Lihat Kas</div>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-slate-900">Praktis</div>
              <div className="text-sm font-medium text-text-muted mt-1 uppercase tracking-wide">Bayar Dari HP</div>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-slate-900">Aman</div>
              <div className="text-sm font-medium text-text-muted mt-1 uppercase tracking-wide">Data Terlindungi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Features Grid */}
      <section id="fitur" className="py-24 px-6 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Manfaat Untuk Lingkungan Kita</h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              Sistem ini dibuat agar pengurus RT dan warga bisa saling percaya dan bekerja sama dengan lebih baik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-10 rounded-3xl space-y-6 border border-transparent hover:border-primary/20 transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Smile className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Mudah Digunakan</h3>
              <p className="text-text-muted leading-relaxed text-lg">
                Tampilan sederhana dengan tulisan yang besar dan jelas. Cocok untuk semua usia, termasuk orang tua.
              </p>
            </div>

            <div className="bg-slate-50 p-10 rounded-3xl space-y-6 border border-transparent hover:border-primary/20 transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Keuangan Jujur</h3>
              <p className="text-text-muted leading-relaxed text-lg">
                Tidak ada lagi rahasia. Warga bisa melihat laporan uang kas RT kapan saja secara terbuka.
              </p>
            </div>

            <div className="bg-slate-50 p-10 rounded-3xl space-y-6 border border-transparent hover:border-primary/20 transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Catatan Aman</h3>
              <p className="text-text-muted leading-relaxed text-lg">
                Semua data pembayaran tersimpan rapi secara digital. Tidak perlu lagi buku catatan yang mudah hilang.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Ease Section */}
      <section id="transparansi" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Dibuat Untuk Kepercayaan <br />
              Dan <span className="text-primary">Kenyamanan Bersama</span>
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              Kami memahami bahwa kepercayaan adalah hal terpenting dalam bertetangga.
              Sistem ini menjamin setiap rupiah iuran warga tercatat dan terkelola dengan baik.
            </p>
            <div className="grid gap-4">
              {[
                "Laporan bulanan bisa diunduh (PDF)",
                "Pesan pemberitahuan bayar otomatis",
                "Tanda terima pembayaran digital",
                "Riwayat iuran lengkap & rapi"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 text-lg font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-border space-y-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Sangat Praktis</div>
                <div className="text-text-muted font-medium">Bisa diakses dari HP atau Komputer</div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 rounded-2xl border border-border">
              <div className="text-center space-y-4">
                <div className="text-sm font-bold text-primary uppercase tracking-widest">Contoh Tampilan Laporan</div>
                <div className="h-4 w-3/4 bg-slate-200 rounded-full mx-auto" />
                <div className="h-4 w-1/2 bg-slate-200 rounded-full mx-auto" />
                <div className="h-4 w-2/3 bg-slate-200 rounded-full mx-auto" />
              </div>
            </div>
            <p className="text-center text-text-dim text-sm italic font-medium leading-relaxed">
              "Sekarang saya bisa cek iuran sambil santai di rumah. <br /> Pengurus RT juga lebih ringan kerjanya."
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start">
              <img src="/logo.png" alt="WargaKlik Logo" className="h-12 w-auto brightness-0 invert" />
            </div>
            <p className="text-slate-400 max-w-xs leading-relaxed">
              Solusi digital untuk manajemen lingkungan yang lebih modern dan harmonis.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="space-y-4">
              <div className="text-sm font-bold uppercase tracking-widest text-slate-500">Akses Cepat</div>
              <div className="flex flex-col gap-3 font-medium">
                <Link href="/login" className="hover:text-primary transition-colors">Masuk Dashboard</Link>
                <Link href="/activate" className="hover:text-primary transition-colors">Aktivasi Akun</Link>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-sm font-bold uppercase tracking-widest text-slate-500">Dukungan</div>
              <div className="flex flex-col gap-3 font-medium text-slate-300">
                <span>Panduan Pengguna</span>
                <span>Kontak Pengurus RT</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
          © 2026 WargaKlik - Membangun Lingkungan Yang Lebih Baik & Digital.
        </div>
      </footer>
    </div>
  );
}
