import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Stethoscope, Building2, Shield, Heart, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import LoginForm from './LoginForm';
import { useLogin } from '../../queries/useAuthQueries';
import { useSession } from './useSession';
import { ROLE_HOME } from './roleHome';

const ROLES = [
  { key: 'ORANG_TUA', label: 'Orang Tua', Icon: Heart },
  { key: 'KADER_POSYANDU', label: 'Kader Posyandu', Icon: Users },
  { key: 'TENAGA_KESEHATAN', label: 'Tenaga Kesehatan', Icon: Stethoscope },
  { key: 'DESA', label: 'Pemerintah Desa', Icon: Building2 },
  { key: 'ADMIN', label: 'Admin', Icon: Shield },
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
            setErrorText('Akun Anda belum disetujui. Silakan hubungi admin atau kader.');
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
      <div className="min-h-screen bg-faint-fog flex items-center justify-center p-[17px]">
        <div className="w-full max-w-[480px]">
          <h1 className="text-heading-lg font-bold text-deep-slate text-center mb-[25px]">
            KMS Digital Lebakwangi
          </h1>

          {expired && (
            <div
              role="alert"
              className="bg-warning/15 border border-warning/30 text-deep-slate px-[17px] py-[13px] rounded-default mb-[17px] text-body-sm text-center"
            >
              Sesi Anda berakhir. Silakan masuk kembali.
            </div>
          )}

          {!selectedRole ? (
            <Card title="Masuk sebagai">
              <div className="flex flex-col gap-[8px]">
                {ROLES.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedRole(key)}
                    className="flex items-center gap-[13px] w-full px-[17px] py-[17px] rounded-default border border-light-ash text-left text-body-sm font-medium text-deep-slate hover:border-primary-500 hover:bg-faint-fog transition-colors duration-150"
                  >
                    <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-polar-mist text-primary-600">
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <span className="flex-1">{label}</span>
                    <ArrowLeft size={16} strokeWidth={1.75} className="rotate-180 text-graphite" />
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={<ArrowLeft size={16} strokeWidth={1.75} />}
                onClick={() => setSelectedRole(null)}
                className="mb-[17px]"
              >
                Kembali
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
