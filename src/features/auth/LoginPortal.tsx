import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  Building2,
  Shield,
  Heart,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import LoginForm from './LoginForm';
import { useLogin } from '../../queries/useAuthQueries';
import { useSession } from './useSession';
import { ROLE_HOME } from './roleHome';

const ROLES = [
  {
    key: 'ORANG_TUA',
    label: 'Orang Tua',
    Icon: Heart,
    desc: 'Pantau pertumbuhan anak Anda',
  },
  {
    key: 'KADER_POSYANDU',
    label: 'Kader Posyandu',
    Icon: Users,
    desc: 'Catat pengukuran bulanan',
  },
  {
    key: 'TENAGA_KESEHATAN',
    label: 'Tenaga Kesehatan',
    Icon: Stethoscope,
    desc: 'Pantau balita & forum tanya jawab',
  },
  {
    key: 'DESA',
    label: 'Pemerintah Desa',
    Icon: Building2,
    desc: 'Rekap gizi se-desa',
  },
  {
    key: 'ADMIN',
    label: 'Admin',
    Icon: Shield,
    desc: 'Kelola seluruh sistem',
  },
];

const TRUST_POINTS = [
  'Data aman, hanya untuk kader posyandu',
  'Bahasa Indonesia sehari-hari',
  'Bisa diakses dari HP',
];

export default function LoginPortal() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  const expired = searchParams.get('expired') === '1';

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [errorText, setErrorText] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, role: currentRole, login } = useSession();
  const loginMutation = useLogin();

  useEffect(() => {
    if (isAuthenticated && currentRole) {
      navigate(ROLE_HOME[currentRole] ?? '/', { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate]);

  const handleLogin = ({ email, password, role }) => {
    setErrorText(null);
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          const userRole = data?.user?.role;
          const userStatus = data?.user?.status;

          if (userStatus === 0) {
            setErrorText(
              'Akun Anda belum disetujui. Silakan hubungi admin atau kader.'
            );
            return;
          }

          if (role !== 'ORANG_TUA' && userRole !== role) {
            setErrorText(
              `Akun ini bukan ${role.replace('_', ' ').toLowerCase()}.`
            );
            return;
          }

          login(data);
          toast.success('Berhasil masuk');
          navigate(ROLE_HOME[userRole] ?? '/', { replace: true });
        },
        onError: (err) => {
          setErrorText(err?.message ?? 'Email atau kata sandi salah');
        },
      }
    );
  };

  return (
    <>
      {toast.contextHolder}
      <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr] bg-faint-fog">
        {/* Left: Brand panel */}
        <aside className="relative hidden lg:flex flex-col justify-between bg-deep-slate text-white overflow-hidden px-[50px] py-[50px] xl:px-[67px] xl:py-[67px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-[120px] -right-[120px] w-[400px] h-[400px] rounded-full bg-primary-500/30 blur-3xl"
          />

          <div className="relative">
            <Link
              to="/"
              className="inline-flex items-center gap-[10px] group"
            >
              <span className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-primary-500 text-white transition-transform group-hover:scale-[1.05] duration-150 ease-out-quart">
                <Heart size={22} strokeWidth={2.25} fill="currentColor" fillOpacity={0.25} />
              </span>
              <span className="flex flex-col leading-[1.1]">
                <span className="text-body-sm font-bold tracking-tight">
                  KMS Digital
                </span>
                <span className="text-caption text-white/60">
                  Posyandu Lebakwangi
                </span>
              </span>
            </Link>
          </div>

          <div className="relative max-w-[520px]">
            <p className="inline-flex items-center gap-[8px] text-caption font-bold uppercase tracking-[0.14em] text-primary-300 mb-[25px]">
              <Sparkles size={14} strokeWidth={2.25} />
              Selamat Datang Kembali
            </p>
            <h2 className="text-display-lg font-bold leading-[1.0] tracking-tight mb-[33px]">
              Tumbuh kembang anak,
              <br />
              <span className="text-primary-300">dalam satu genggaman.</span>
            </h2>
            <p className="text-body-lg text-white/70 mb-[33px] leading-relaxed">
              Catat pengukuran balita dan ikuti perkembangan gizi anak bersama
              kader posyandu desa Anda.
            </p>
            <ul className="space-y-[13px]">
              {TRUST_POINTS.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-[13px] text-body-sm text-white/80"
                >
                  <span className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-primary-500/30 text-primary-300 shrink-0">
                    <CheckCircle2 size={16} strokeWidth={2.25} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative text-caption text-white/50">
            · {new Date().getFullYear()} Posyandu Lebakwangi
          </div>
        </aside>

        {/* Right: Form panel */}
        <main className="flex flex-col min-h-screen lg:min-h-0">
          {/* Mobile top bar */}
          <header className="lg:hidden flex items-center justify-between px-[17px] py-[17px] border-b border-light-ash bg-white">
            <Link
              to="/"
              className="flex items-center gap-[10px]"
            >
              <span className="flex items-center justify-center w-[36px] h-[36px] rounded-full bg-primary-500 text-white">
                <Heart size={18} strokeWidth={2.25} fill="currentColor" fillOpacity={0.25} />
              </span>
              <span className="flex flex-col leading-[1.1]">
                <span className="text-body-sm font-bold text-deep-slate tracking-tight">
                  KMS Digital
                </span>
                <span className="text-caption text-graphite">Posyandu Lebakwangi</span>
              </span>
            </Link>
          </header>

          <div className="flex-1 flex items-center justify-center px-[17px] py-[33px] md:px-[33px] lg:px-[67px] xl:px-[95px]">
            <div className="w-full max-w-[440px]">
              {expired && (
                <div
                  role="alert"
                  className="flex items-center gap-[13px] bg-warning/15 border border-warning/30 text-deep-slate px-[17px] py-[13px] rounded-default mb-[25px] text-body-sm"
                >
                  <span className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-warning/30 shrink-0">
                    <Sparkles size={16} strokeWidth={2} />
                  </span>
                  Sesi Anda berakhir. Silakan masuk kembali.
                </div>
              )}

              {!selectedRole ? (
                <>
                  <div className="mb-[33px]">
                    <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[13px]">
                      Mulai Masuk
                    </p>
                    <h1 className="text-heading-lg md:text-display font-bold text-deep-slate leading-[1.05] tracking-tight mb-[13px]">
                      Pilih peran Anda
                    </h1>
                    <p className="text-body-sm text-graphite">
                      Setiap peran punya akses dan tampilan yang berbeda.
                    </p>
                  </div>

                  <div className="flex flex-col gap-[10px]">
                    {ROLES.map(({ key, label, Icon, desc }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedRole(key)}
                        className="group flex items-center gap-[17px] w-full px-[21px] py-[17px] rounded-default bg-white border border-light-ash text-left hover:border-primary-300 hover:shadow-card transition-all duration-150 ease-out-quart"
                      >
                        <span className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-primary-50 text-primary-600 shrink-0 transition-colors group-hover:bg-primary-500 group-hover:text-white">
                          <Icon size={22} strokeWidth={2} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-body-sm font-semibold text-deep-slate">
                            {label}
                          </span>
                          <span className="block text-caption text-graphite mt-[2px]">
                            {desc}
                          </span>
                        </span>
                        <ArrowRight
                          size={18}
                          strokeWidth={2}
                          className="text-graphite shrink-0 transition-transform group-hover:translate-x-[2px] group-hover:text-primary-600"
                        />
                      </button>
                    ))}
                  </div>

                  <div className="mt-[33px] pt-[25px] border-t border-light-ash">
                    <p className="text-body-sm text-graphite">
                      Belum punya akun?{' '}
                      <Link
                        to="/sign-up"
                        className="text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        Daftar sekarang
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    leadingIcon={<ArrowLeft size={16} strokeWidth={2} />}
                    onClick={() => {
                      setSelectedRole(null);
                      setErrorText(null);
                    }}
                    className="mb-[17px] -ml-[8px]"
                  >
                    Pilih peran lain
                  </Button>
                  <LoginForm
                    role={selectedRole}
                    onSubmit={handleLogin}
                    loading={loginMutation.isPending}
                    errorText={errorText}
                  />
                  <div className="mt-[25px] pt-[21px] border-t border-light-ash">
                    <p className="text-body-sm text-graphite">
                      Belum punya akun?{' '}
                      <Link
                        to="/sign-up"
                        className="text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        Daftar sekarang
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
