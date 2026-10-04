'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Shield } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

function GoogleGLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { signInWithPassword, signInWithGoogle, isConfigured } = useAppStore();
  const [roleType, setRoleType] = useState<'pemain' | 'admin'>('pemain');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('error');
    const messages: Record<string, string> = {
      config: 'Koneksi Supabase belum dikonfigurasi oleh pengurus.',
      oauth_failed: 'Login Google gagal atau dibatalkan. Silakan coba kembali.',
      session_failed: 'Sesi login tidak dapat diverifikasi.',
      profile_failed: 'Profil akun belum tersedia di database.',
      account_inactive: 'Akun ini sedang tidak aktif. Hubungi Admin Khoirunnada.',
      not_admin: 'Akun Google ini bukan akun resmi Admin atau Bendahara.',
      not_member: 'Akun ini belum memiliki izin portal pemain.',
      admin_portal_required: 'Akun khusus pengurus harus masuk melalui tab Admin & Kas.',
    };
    const timer = window.setTimeout(() => {
      if (code && messages[code]) setError(messages[code]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Silakan masukkan email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Format email tidak valid. Masukkan format email yang benar (contoh: nama@domain.com).');
      return;
    }
    if (!password) {
      setError('Silakan masukkan password.');
      return;
    }

    setIsLoading(true);
    try {
      const destination = await signInWithPassword(email, password, roleType);
      router.push(destination);
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Login gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle(roleType);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Login Google gagal.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-4 antialiased text-[#151917]">
      <div className="w-full max-w-[380px] flex flex-col items-center">
        {/* Single Card Login with Logo inside */}
        <GlassCard className="w-full p-6 sm:p-7 text-center" variant="elevated">
          {/* Logo inside Card */}
          <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
            <img
              src="/logo-khoirunnada.png"
              alt="Logo Hadroh Khoirunnada"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>

          {/* Clean Title */}
          <h2 className="text-sm sm:text-base font-bold tracking-widest text-[#151917] font-serif uppercase mb-4">
            HADROH KHOIRUNNADA
          </h2>

          {/* 1. Pilihan Peran: Pemain vs Admin */}
          <div className="w-full p-1 bg-black/[0.04] border border-black/5 rounded-xl flex items-center mb-3">
            <button
              type="button"
              onClick={() => {
                setRoleType('pemain');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                roleType === 'pemain'
                  ? 'bg-white text-[#996A19] font-bold shadow-xs border border-black/5'
                  : 'text-[#585145] hover:text-[#151917]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Pemain</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleType('admin');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                roleType === 'admin'
                  ? 'bg-white text-[#996A19] font-bold shadow-xs border border-black/5'
                  : 'text-[#585145] hover:text-[#151917]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin & Kas</span>
            </button>
          </div>

          {/* Role Description Hint */}
          <p className="text-[11px] text-[#585145] text-center mb-5 font-medium leading-tight">
            {roleType === 'pemain'
              ? 'Login khusus pemain, vokalis, dan anggota majelis'
              : 'Login khusus 1 akun Google Admin dan Bendahara kas'}
          </p>

          {/* Form Email & Password */}
          <form onSubmit={handleEmailPasswordLogin} autoComplete="off" className="space-y-4 text-left">
            {/* Input Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#151917] mb-1.5">
                {roleType === 'pemain' ? 'Email Pemain' : 'Email Admin / Bendahara'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#996A19]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Isi Email anda..."
                  autoComplete="off"
                  className="glass-input has-left-icon !pl-11 !pr-4 text-sm font-medium placeholder:text-[#585145]/45"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#151917] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#996A19]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Isi Password Anda..."
                  autoComplete="new-password"
                  className="glass-input has-left-icon has-right-icon !pl-11 !pr-11 text-sm font-medium placeholder:text-[#585145]/45"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#585145] hover:text-[#151917] cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[11px] text-[#C84A45] font-medium leading-tight">{error}</p>
            )}

            {!isConfigured && !error && (
              <p className="text-[11px] text-[#C84A45] font-medium leading-tight">
                Koneksi Supabase belum dikonfigurasi. Isi environment variable terlebih dahulu.
              </p>
            )}

            {/* Tombol Masuk */}
            <GlassButton
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={!isConfigured}
              className="mt-2"
            >
              {roleType === 'pemain' ? 'Masuk sebagai Pemain' : 'Masuk sebagai Admin'}
            </GlassButton>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/80 px-2 text-[#585145] rounded-full">atau</span>
              </div>
            </div>

            {/* Tombol Login Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || !isConfigured}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-white hover:bg-neutral-50 text-[#151917] font-semibold text-sm border border-neutral-300/80 shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#996A19]" />
                  <span>Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  <GoogleGLogo className="w-5 h-5 shrink-0" />
                  <span>
                    {roleType === 'pemain'
                      ? 'Masuk Google (Pemain)'
                      : 'Masuk Google (Admin & Kas)'}
                  </span>
                </>
              )}
            </button>
          </form>
        </GlassCard>

        {/* Footer */}
        <footer className="mt-4 text-xs text-[#585145] flex items-center gap-1.5 justify-center opacity-75">
          <span>Khidmah Lil Ummah</span>
          <span>•</span>
          <span>Hadroh Khoirunnada</span>
        </footer>
      </div>
    </div>
  );
}
