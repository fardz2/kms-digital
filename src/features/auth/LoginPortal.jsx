import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import LoginForm from './LoginForm';
import { useLogin } from '../../queries/useAuthQueries';
import { useSession } from './useSession';

const ROLES = [
  { key: 'ORANG_TUA', label: 'Orang Tua', icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67' },
  { key: 'KADER_POSYANDU', label: 'Kader Posyandu', icon: '\uD83C\uDFE5' },
  { key: 'TENAGA_KESEHATAN', label: 'Tenaga Kesehatan', icon: '\uD83D\uDC69\u200D\u2695\uFE0F' },
  { key: 'DESA', label: 'Pemerintah Desa', icon: '\uD83C\uDFDB\uFE0F' },
  { key: 'ADMIN', label: 'Admin', icon: '\u2699\uFE0F' },
];

const ROLE_HOME = {
  ORANG_TUA: '/orangtua/balita',
  KADER_POSYANDU: '/kader/beranda',
  TENAGA_KESEHATAN: '/tenkes/forum',
  DESA: '/desa/beranda',
  ADMIN: '/admin/dashboard/desa',
};

export default function LoginPortal() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  const expired = searchParams.get('expired') === '1';

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [errorText, setErrorText] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, role: currentRole } = useSession();
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
            setErrorText('Akun Anda belum disetujui. Silakan hubungi admin/kader.');
            return;
          }

          if (role !== 'ORANG_TUA' && userRole !== role) {
            setErrorText(`Akun ini bukan ${role.replace('_', ' ').toLowerCase()}.`);
            return;
          }

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
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-lg)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 480 }}>
          <h1
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-bold)',
              textAlign: 'center',
              marginBottom: 'var(--space-lg)',
            }}
          >
            KMS Digital Lebakwangi
          </h1>

          {expired && (
            <div
              role="alert"
              style={{
                background: 'var(--color-warning)',
                color: 'var(--color-text)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-button)',
                marginBottom: 'var(--space-md)',
                textAlign: 'center',
              }}
            >
              Sesi Anda berakhir, silakan masuk kembali.
            </div>
          )}

          {!selectedRole ? (
            <Card>
              <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>Masuk sebagai:</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {ROLES.map((r) => (
                  <Button
                    key={r.key}
                    variant="secondary"
                    size="lg"
                    onClick={() => setSelectedRole(r.key)}
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                  >
                    <span style={{ marginRight: 'var(--space-sm)' }}>{r.icon}</span>
                    {r.label}
                  </Button>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)} style={{ marginBottom: 'var(--space-md)' }}>
                ← Kembali
              </Button>
              <LoginForm
                role={selectedRole}
                onSubmit={handleLogin}
                loading={loginMutation.isPending}
                errorText={errorText}
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
