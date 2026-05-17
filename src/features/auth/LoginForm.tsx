import React from 'react';
import { Form, Input } from 'antd';
import { Mail, KeyRound, LogIn, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';

const ROLE_LABELS = {
  ORANG_TUA: 'Orang Tua',
  KADER_POSYANDU: 'Kader Posyandu',
  TENAGA_KESEHATAN: 'Tenaga Kesehatan',
  DESA: 'Pemerintah Desa',
  ADMIN: 'Admin',
};

export default function LoginForm({ role, onSubmit, loading, errorText }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit?.({ email: values.email, password: values.password, role });
  };

  return (
    <div className="w-full">
      <div className="mb-[25px]">
        <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[13px]">
          {ROLE_LABELS[role] ?? 'Pengguna'}
        </p>
        <h2 className="text-heading-lg md:text-display font-bold text-deep-slate leading-[1.05] tracking-tight">
          Masuk ke akun Anda
        </h2>
      </div>

      {errorText && (
        <div
          role="alert"
          className="flex items-start gap-[13px] bg-danger/10 border border-danger/30 text-deep-slate px-[17px] py-[13px] rounded-default mb-[21px] text-body-sm"
        >
          <span className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-danger/20 text-danger shrink-0">
            <AlertTriangle size={16} strokeWidth={2.25} />
          </span>
          <span className="flex-1 text-danger leading-relaxed">
            {errorText}
          </span>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label={
            <span className="text-body-sm font-semibold text-deep-slate">
              Email
            </span>
          }
          name="email"
          rules={[
            { required: true, message: 'Email masih kosong' },
            { type: 'email', message: 'Format email tidak valid' },
          ]}
        >
          <Input
            prefix={
              <Mail
                size={18}
                strokeWidth={1.75}
                className="text-graphite mr-[6px]"
              />
            }
            placeholder="email@contoh.com"
            className="h-[52px] text-base"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          label={
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-deep-slate">
                Kata Sandi
              </span>
            </div>
          }
          name="password"
          rules={[{ required: true, message: 'Kata sandi masih kosong' }]}
        >
          <Input.Password
            prefix={
              <KeyRound
                size={18}
                strokeWidth={1.75}
                className="text-graphite mr-[6px]"
              />
            }
            placeholder="Kata sandi Anda"
            className="h-[52px] text-base"
            autoComplete="current-password"
          />
        </Form.Item>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          trailingIcon={!loading ? <LogIn size={20} strokeWidth={2.25} /> : null}
          className="w-full mt-[8px]"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
      </Form>
    </div>
  );
}
