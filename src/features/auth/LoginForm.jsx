import React from 'react';
import { Form, Input } from 'antd';
import { Mail, KeyRound } from 'lucide-react';
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
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-heading font-semibold text-deep-slate mb-[17px]">
        Masuk sebagai {ROLE_LABELS[role] ?? 'Pengguna'}
      </h2>
      {errorText && (
        <div
          role="alert"
          className="bg-danger/10 border border-danger/30 text-danger px-[17px] py-[13px] rounded-default mb-[17px] text-body-sm"
        >
          {errorText}
        </div>
      )}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label={<span className="text-body-sm font-medium text-deep-slate">Email</span>}
          name="email"
          rules={[
            { required: true, message: 'Email masih kosong' },
            { type: 'email', message: 'Format email tidak valid' },
          ]}
        >
          <Input
            prefix={<Mail size={16} strokeWidth={1.75} className="text-graphite" />}
            placeholder="email@contoh.com"
            className="h-[52px] text-base"
          />
        </Form.Item>
        <Form.Item
          label={<span className="text-body-sm font-medium text-deep-slate">Kata Sandi</span>}
          name="password"
          rules={[{ required: true, message: 'Kata sandi masih kosong' }]}
        >
          <Input.Password
            prefix={<KeyRound size={16} strokeWidth={1.75} className="text-graphite" />}
            placeholder="Kata sandi"
            className="h-[52px] text-base"
          />
        </Form.Item>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Masuk
        </Button>
      </Form>
    </div>
  );
}
