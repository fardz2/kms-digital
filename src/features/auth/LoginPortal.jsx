import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import LoginForm from './LoginForm';
import { useLogin } from '../../queries/useAuthQueries';
import { useSession } from './useSession';
import { ROLE_HOME } from './roleHome';

const ROLES = [
  { key: 'ORANG_TUA', label: 'Orang Tua', icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67' },
  { key: 'KADER_POSYANDU', label: 'Kader Posyandu', icon: '\uD83C\uDFE5' },
  { key: 'TENAGA_KESEHATAN', label: 'Tenaga Kesehatan', icon: '\uD83D\uDC69\u200D\u2695\uFE0F' },
  { key: 'DESA', label: 'Pemerintah Desa', icon: '\uD83C\uDFDB\uFE0F' },
  { key: 'ADMIN', label: 'Admin', icon: '\u2699\uFE0F' },
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
            setErrorText('Akun Anda belum disetujui. Silakan hubungi admin/kader.');
            return;
          }

          if (role !== 'ORANG_TUA' && userRole !== role) {
            setErrorText(`Akun ini bukan ${role.replace('_', ' ').toLowerCase()}.`);
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <h1 className="text-h1 font-display text-neutral-900 text-center mb-6">
            KMS Digital Lebakwangi
          </h1>

          {expired && (
            <div
              role="alert"
              className="bg-warning-bg text-amber-900 px-4 py-3 rounded-button mb-4 text-center"
            >
              Sesi Anda berakhir, silakan masuk kembali.
            </div>
          )}

          {!selectedRole ? (
            <Card>
              <h2 className="text-h3 font-display text-neutral-900 mb-4">Masuk sebagai:</h2>
              <div className="flex flex-col gap-2">
                {ROLES.map((r) => (
                  <Button
                    key={r.key}
                    variant="secondary"
                    size="lg"
                    onClick={() => setSelectedRole(r.key)}
                    className="justify-start w-full"
                  >
                    <span className="mr-2">{r.icon}</span>
                    {r.label}
                  </Button>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRole(null)}
                className="mb-4"
              >
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
