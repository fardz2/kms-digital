import React from 'react';
import { Form, Input } from 'antd';
import { MailOutlined, KeyOutlined } from '@ant-design/icons';
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
      <h2 className="text-h2 font-display text-neutral-900 mb-4">
        Masuk sebagai {ROLE_LABELS[role] ?? 'Pengguna'}
      </h2>
      {errorText && (
        <div
          role="alert"
          className="bg-danger text-white px-4 py-3 rounded-button mb-4 text-base"
        >
          {errorText}
        </div>
      )}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label={<span className="text-caption text-neutral-700">Email</span>}
          name="email"
          rules={[
            { required: true, message: 'Email masih kosong' },
            { type: 'email', message: 'Format email tidak valid' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="email@contoh.com"
            className="h-12 text-base"
          />
        </Form.Item>
        <Form.Item
          label={<span className="text-caption text-neutral-700">Kata Sandi</span>}
          name="password"
          rules={[{ required: true, message: 'Kata sandi masih kosong' }]}
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder="Kata sandi"
            className="h-12 text-base"
          />
        </Form.Item>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          MASUK
        </Button>
      </Form>
    </div>
  );
}
